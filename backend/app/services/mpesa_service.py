"""
M-Pesa (Safaricom) Payment Integration Service.
Implements STK Push (Lipa Na M-Pesa Online) and callback handling.
"""
import base64
import requests
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class MpesaService:
    """M-Pesa payment integration service."""
    
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.passkey = settings.MPESA_PASSKEY
        self.shortcode = settings.MPESA_SHORTCODE
        self.callback_url = settings.MPESA_CALLBACK_URL
        self.environment = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
        
        # Set API URLs based on environment
        if self.environment == 'production':
            self.auth_url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            self.stk_push_url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            self.query_url = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
        else:
            self.auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            self.stk_push_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            self.query_url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
    
    def get_access_token(self) -> Optional[str]:
        """
        Generate M-Pesa OAuth access token.
        
        Returns:
            Access token string or None if failed
        """
        try:
            # Create auth credentials
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            auth_bytes = auth_string.encode('utf-8')
            auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')
            
            headers = {
                'Authorization': f'Basic {auth_base64}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(self.auth_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            access_token = result.get('access_token')
            
            if access_token:
                logger.info("M-Pesa access token generated successfully")
                return access_token
            else:
                logger.error("No access token in M-Pesa response")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get M-Pesa access token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting M-Pesa token: {str(e)}")
            return None
    
    def generate_password(self, timestamp: str) -> str:
        """
        Generate M-Pesa password for STK Push.
        
        Args:
            timestamp: Timestamp in format YYYYMMDDHHmmss
            
        Returns:
            Base64 encoded password
        """
        password_string = f"{self.shortcode}{self.passkey}{timestamp}"
        password_bytes = password_string.encode('utf-8')
        return base64.b64encode(password_bytes).decode('utf-8')
    
    def initiate_stk_push(
        self,
        phone_number: str,
        amount: float,
        account_reference: str,
        transaction_desc: str
    ) -> Dict[str, Any]:
        """
        Initiate M-Pesa STK Push (Lipa Na M-Pesa Online).
        
        Args:
            phone_number: Customer phone number (254XXXXXXXXX format)
            amount: Amount to charge
            account_reference: Reference for the transaction
            transaction_desc: Description of the transaction
            
        Returns:
            Dictionary with response data including checkout_request_id
        """
        try:
            # Get access token
            access_token = self.get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'message': 'Failed to authenticate with M-Pesa',
                    'error_code': 'AUTH_FAILED'
                }
            
            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            # Format phone number (ensure it starts with 254)
            if phone_number.startswith('+'):
                phone_number = phone_number[1:]
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]
            if not phone_number.startswith('254'):
                phone_number = '254' + phone_number
            
            # Prepare STK Push request
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),  # M-Pesa requires integer amount
                'PartyA': phone_number,
                'PartyB': self.shortcode,
                'PhoneNumber': phone_number,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference[:12],  # Max 12 chars
                'TransactionDesc': transaction_desc[:13]  # Max 13 chars
            }
            
            logger.info(f"Initiating M-Pesa STK Push for {phone_number}, amount: {amount}")
            
            response = requests.post(
                self.stk_push_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            result = response.json()
            
            # Check response
            if response.status_code == 200 and result.get('ResponseCode') == '0':
                logger.info(f"M-Pesa STK Push successful: {result.get('CheckoutRequestID')}")
                return {
                    'success': True,
                    'message': result.get('CustomerMessage', 'Payment request sent'),
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'merchant_request_id': result.get('MerchantRequestID'),
                    'response_code': result.get('ResponseCode')
                }
            else:
                error_message = result.get('errorMessage') or result.get('ResponseDescription', 'STK Push failed')
                logger.error(f"M-Pesa STK Push failed: {error_message}")
                return {
                    'success': False,
                    'message': error_message,
                    'error_code': result.get('errorCode'),
                    'response_code': result.get('ResponseCode')
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa API request failed: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to connect to M-Pesa service',
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error in M-Pesa STK Push: {str(e)}")
            return {
                'success': False,
                'message': 'An unexpected error occurred',
                'error': str(e)
            }
    
    def query_stk_status(
        self,
        checkout_request_id: str
    ) -> Dict[str, Any]:
        """
        Query the status of an STK Push transaction.
        
        Args:
            checkout_request_id: CheckoutRequestID from STK Push response
            
        Returns:
            Dictionary with transaction status
        """
        try:
            # Get access token
            access_token = self.get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'message': 'Failed to authenticate with M-Pesa'
                }
            
            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }
            
            response = requests.post(
                self.query_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            result = response.json()
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'result_code': result.get('ResultCode'),
                    'result_desc': result.get('ResultDesc'),
                    'response_code': result.get('ResponseCode')
                }
            else:
                return {
                    'success': False,
                    'message': result.get('errorMessage', 'Query failed')
                }
                
        except Exception as e:
            logger.error(f"Error querying M-Pesa status: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to query transaction status',
                'error': str(e)
            }
    
    @staticmethod
    def process_callback(callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process M-Pesa callback data.
        
        Args:
            callback_data: Callback data from M-Pesa
            
        Returns:
            Processed callback information
        """
        try:
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            merchant_request_id = stk_callback.get('MerchantRequestID')
            
            # Extract callback metadata
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])
            
            metadata = {}
            for item in items:
                name = item.get('Name')
                value = item.get('Value')
                if name:
                    metadata[name] = value
            
            return {
                'success': result_code == 0,
                'result_code': result_code,
                'result_desc': result_desc,
                'checkout_request_id': checkout_request_id,
                'merchant_request_id': merchant_request_id,
                'amount': metadata.get('Amount'),
                'mpesa_receipt_number': metadata.get('MpesaReceiptNumber'),
                'transaction_date': metadata.get('TransactionDate'),
                'phone_number': metadata.get('PhoneNumber')
            }
            
        except Exception as e:
            logger.error(f"Error processing M-Pesa callback: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


# Create singleton instance
mpesa_service = MpesaService()
