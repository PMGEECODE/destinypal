export interface CardInfo {
  type: string;
  brand: string;
  icon: string;
}

const CARD_PATTERNS: { [key: string]: { pattern: RegExp; icon: string; name: string } } = {
  visa: {
    pattern: /^4/,
    icon: '💳',
    name: 'Visa',
  },
  mastercard: {
    pattern: /^(5[1-5]|2[2-7])/,
    icon: '💳',
    name: 'Mastercard',
  },
  amex: {
    pattern: /^3[47]/,
    icon: '💳',
    name: 'American Express',
  },
  discover: {
    pattern: /^6(?:011|5)/,
    icon: '💳',
    name: 'Discover',
  },
  diners: {
    pattern: /^3(?:0[0-5]|[68])/,
    icon: '💳',
    name: 'Diners Club',
  },
  jcb: {
    pattern: /^35/,
    icon: '💳',
    name: 'JCB',
  },
  unionpay: {
    pattern: /^62/,
    icon: '💳',
    name: 'UnionPay',
  },
};

export function detectCardType(cardNumber: string): CardInfo {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  for (const [type, { pattern, icon, name }] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(cleanNumber)) {
      return { type, brand: name, icon };
    }
  }

  return { type: 'unknown', brand: 'Unknown', icon: '💳' };
}

export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function validateCVV(cvv: string, cardType: string): boolean {
  const cleanCVV = cvv.replace(/\s/g, '');

  if (!/^\d+$/.test(cleanCVV)) {
    return false;
  }

  if (cardType === 'amex') {
    return cleanCVV.length === 4;
  }

  return cleanCVV.length === 3;
}

export function validateExpiryDate(month: string, year: string): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);

  if (isNaN(expMonth) || isNaN(expYear)) {
    return false;
  }

  if (expMonth < 1 || expMonth > 12) {
    return false;
  }

  const fullYear = expYear < 100 ? 2000 + expYear : expYear;

  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && expMonth < currentMonth) {
    return false;
  }

  return true;
}

export function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\s/g, '');
  const cardInfo = detectCardType(cleanValue);

  if (cardInfo.type === 'amex') {
    return cleanValue
      .replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
      .substr(0, 17);
  }

  return cleanValue
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .substr(0, 19);
}

export function validatePhoneNumber(phone: string, country: string = 'KE'): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (country === 'KE') {
    return /^(\+?254|0)?[17]\d{8}$/.test(cleanPhone);
  }

  return /^\+?\d{10,15}$/.test(cleanPhone);
}

export function formatPhoneNumber(phone: string, country: string = 'KE'): string {
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (country === 'KE') {
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('+254')) {
      cleanPhone = cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }
  }

  return cleanPhone;
}
