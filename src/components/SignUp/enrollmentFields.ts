export interface MailingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  county: string;
}

export type MailingAddressField = keyof MailingAddress;

export const EMPTY_MAILING_ADDRESS: MailingAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  county: '',
};

export function cleanMailingAddress(address: MailingAddress): MailingAddress {
  return {
    line1: address.line1.trim(),
    line2: address.line2.trim(),
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    zip: address.zip.trim(),
    county: address.county.trim(),
  };
}

export function isMailingAddressEmpty(address: MailingAddress): boolean {
  const cleaned = cleanMailingAddress(address);
  return Object.values(cleaned).every((value) => value === '');
}

export function mailingAddressPayload(address: MailingAddress): MailingAddress {
  return cleanMailingAddress(address);
}

export function validateMiddleName(middleName: string, hasNoMiddleName: boolean): string {
  if (hasNoMiddleName) return '';

  const cleaned = middleName.trim();
  if (!cleaned) return 'Enter a middle name or select "I do not have a middle name".';
  if (/^\p{L}\.?$/u.test(cleaned)) return 'Please enter the full middle name, not an initial.';

  return '';
}
