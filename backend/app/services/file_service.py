"""
Secure file storage service with encryption.
"""
import os
import uuid
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.core.config import settings


class FileEncryptionService:
    """Service for encrypting and decrypting files."""

    def __init__(self):
        # Use environment variable for master key or generate one
        master_key = os.getenv("FILE_ENCRYPTION_KEY", settings.SECRET_KEY)
        self.salt = os.getenv("FILE_ENCRYPTION_SALT", "destiny_pal_salt_2024").encode()
        self._fernet = self._create_fernet(master_key)

    def _create_fernet(self, master_key: str) -> Fernet:
        """Create Fernet instance from master key."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=480000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(master_key.encode()))
        return Fernet(key)

    def encrypt_file(self, file_data: bytes) -> bytes:
        """Encrypt file data."""
        return self._fernet.encrypt(file_data)

    def decrypt_file(self, encrypted_data: bytes) -> bytes:
        """Decrypt file data."""
        return self._fernet.decrypt(encrypted_data)


class SecureFileStorageService:
    """Service for secure file storage with student-specific folders."""

    def __init__(self):
        self.base_upload_dir = Path(os.getenv("UPLOAD_DIR", "uploads"))
        self.encryption_service = FileEncryptionService()
        self.base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        self._ensure_base_dir()

    def _ensure_base_dir(self):
        """Ensure base upload directory exists."""
        self.base_upload_dir.mkdir(parents=True, exist_ok=True)

    def _get_student_folder(self, student_id: str) -> Path:
        """Get or create student-specific folder using hashed ID."""
        # Hash student ID for additional security
        hashed_id = hashlib.sha256(student_id.encode()).hexdigest()[:16]
        student_folder = self.base_upload_dir / "students" / hashed_id
        student_folder.mkdir(parents=True, exist_ok=True)
        return student_folder

    def _generate_secure_filename(self, original_filename: str, document_type: str) -> str:
        """Generate a secure unique filename."""
        # Get file extension
        ext = Path(original_filename).suffix.lower()
        # Generate unique identifier
        unique_id = secrets.token_hex(16)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        return f"{document_type}_{timestamp}_{unique_id}{ext}"

    async def upload_file(
        self,
        student_id: str,
        file_data: bytes,
        original_filename: str,
        document_type: str,
        mime_type: str,
        encrypt: bool = True,
    ) -> Tuple[str, str, bool]:
        """
        Upload and optionally encrypt a file.
        
        Returns:
            Tuple of (file_path, file_url, is_encrypted)
        """
        # Get student folder
        student_folder = self._get_student_folder(student_id)
        
        # Generate secure filename
        secure_filename = self._generate_secure_filename(original_filename, document_type)
        
        # Encrypt file if requested
        if encrypt:
            file_data = self.encryption_service.encrypt_file(file_data)
            secure_filename = f"enc_{secure_filename}"
        
        # Write file
        file_path = student_folder / secure_filename
        with open(file_path, "wb") as f:
            f.write(file_data)
        
        if encrypt:
            file_url = f"{self.base_url}/api/v1/files/{student_id}/{secure_filename}"
        else:
            # Profile photos and other public files use the public endpoint
            file_url = f"{self.base_url}/api/v1/files/public/{student_id}/{secure_filename}"
        
        return str(file_path), file_url, encrypt

    async def download_file(
        self,
        student_id: str,
        filename: str,
    ) -> Tuple[bytes, bool]:
        """
        Download and optionally decrypt a file.
        
        Returns:
            Tuple of (file_data, was_encrypted)
        """
        student_folder = self._get_student_folder(student_id)
        file_path = student_folder / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {filename}")
        
        with open(file_path, "rb") as f:
            file_data = f.read()
        
        # Check if file is encrypted
        is_encrypted = filename.startswith("enc_")
        if is_encrypted:
            file_data = self.encryption_service.decrypt_file(file_data)
        
        return file_data, is_encrypted

    async def delete_file(self, student_id: str, filename: str) -> bool:
        """Delete a file."""
        student_folder = self._get_student_folder(student_id)
        file_path = student_folder / filename
        
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def generate_download_token(self, student_id: str, document_id: str) -> Tuple[str, datetime]:
        """Generate a temporary download token."""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        # In production, store this in Redis or database
        return token, expires_at


# Singleton instance
file_storage_service = SecureFileStorageService()
