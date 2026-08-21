// Disposable email domain checker on the client side

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minmail.com', '20minutemail.com',
  'anonbox.net', 'burnermail.io', 'crazymailing.com', 'dispostable.com', 'dropmail.me',
  'emailondeck.com', 'fakeinbox.com', 'fakemailgenerator.com', 'generator.email', 'getairmail.com',
  'getnada.com', 'guerrillamail.biz', 'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'incognitomail.org', 'inboxkitten.com', 'maildrop.cc',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'mailnesia.com', 'mailnull.com',
  'mohmal.com', 'mytrashmail.com', 'mytemp.email', 'nada.ltd', 'sharklasers.com',
  'spam4.me', 'spambox.us', 'spamfree24.org', 'spamgourmet.com', 'temp-mail.org', 'tempmail.com',
  'tempmail.net', 'tempmailaddress.com', 'throwawaymail.com', 'trashmail.com', 'trashmail.net',
  'trashmail.org', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'zippymail.info', 'disposablemail.com',
  'grr.la', 'pokemail.net', 'tempail.com', 'guerrillamail.info', 'armyspy.com', 'cuvox.de', 'dayrep.com',
  'einrot.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'mvrht.com', 'binkmail.com', 'safetymail.info', 'trashmail.ws', 'mytempmail.com', 'mohmal.im'
]);

const STANDARD_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'icloud.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
  'zoho.com', 'aol.com', 'fastmail.com', 'gmx.com', 'mail.com'
]);

export interface EmailCheckResult {
  isValid: boolean;
  isDisposable: boolean;
  domain: string;
  inferredCompany?: string;
  message?: string;
}

export function validateRecruiterEmail(email: string): EmailCheckResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      isDisposable: false,
      domain: '',
      message: 'Please enter your email address.'
    };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      isDisposable: false,
      domain: '',
      message: 'Please enter a valid email format (e.g. name@company.com).'
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, isDisposable: false, domain: '', message: 'Invalid email address.' };
  }

  const domain = parts[1];

  // Check against disposable domain list
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      isDisposable: true,
      domain,
      message: 'Temporary / disposable emails are blocked. Please use your corporate or standard email.'
    };
  }

  // Check subdomains
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain.endsWith('.' + d)) {
      return {
        isValid: false,
        isDisposable: true,
        domain,
        message: 'Temporary / disposable emails are blocked. Please use your corporate or standard email.'
      };
    }
  }

  // Infer company name
  let inferredCompany: string | undefined = undefined;
  if (!STANDARD_PROVIDERS.has(domain)) {
    const rawCo = domain.split('.')[0];
    if (rawCo) {
      inferredCompany = rawCo.charAt(0).toUpperCase() + rawCo.slice(1);
    }
  }

  return {
    isValid: true,
    isDisposable: false,
    domain,
    inferredCompany,
    message: inferredCompany ? `Identified as recruiter from ${inferredCompany}` : 'Valid standard email address.'
  };
}
