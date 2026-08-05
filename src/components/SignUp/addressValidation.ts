import getServerURL from '../../serverOverride';
import { formatAddress } from '../../utils/address';
import { cleanMailingAddress, MailingAddress } from './enrollmentFields';

export type AddressValidationAction = 'ACCEPT' | 'CONFIRM' | 'CONFIRM_ADD_SUBPREMISES' | 'FIX';

export type AddressValidationResponse = {
  status: string;
  message?: string;
  action?: AddressValidationAction;
  formattedAddress?: string;
  suggestedAddress?: MailingAddress;
};

export function mailingAddressInputError(address: MailingAddress, noLine2: boolean): string {
  const cleaned = cleanMailingAddress(address);
  if (!cleaned.line1 || !cleaned.city || !cleaned.state || !cleaned.zip) {
    return 'Street address, city, state, and ZIP are required.';
  }
  if (!/^[A-Z]{2}$/.test(cleaned.state)) return 'State must be a two-letter abbreviation.';
  if (!/^\d{5}(?:-\d{4})?$/.test(cleaned.zip)) return 'Enter a valid 5- or 9-digit ZIP code.';
  if (!cleaned.line2 && !noLine2) {
    return 'Enter an apartment, suite, or unit, or select “No apartment, suite, or unit.”';
  }
  if (cleaned.line2 && noLine2) return 'Clear the no-unit checkbox when a second address line is entered.';
  return '';
}

export async function validateMailingAddress(
  address: MailingAddress,
  noLine2: boolean,
): Promise<MailingAddress> {
  const inputError = mailingAddressInputError(address, noLine2);
  if (inputError) throw new Error(inputError);
  const response = await fetch(`${getServerURL()}/api/address-validation`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: cleanMailingAddress(address), noLine2 }),
  });
  const result = await response.json() as AddressValidationResponse;
  if (!response.ok || result.status !== 'SUCCESS') {
    throw new Error(result.message || 'Address validation is unavailable.');
  }
  if (result.action === 'FIX') {
    throw new Error(result.message || 'Correct the mailing address and validate it again.');
  }

  const suggested = cleanMailingAddress(result.suggestedAddress || address);
  if (result.action === 'CONFIRM' || result.action === 'CONFIRM_ADD_SUBPREMISES') {
    const suggestedDisplay = result.formattedAddress || formatAddress(suggested);
    const confirmed = window.confirm(
      `${result.message || 'Review the validated address.'}\n\n${suggestedDisplay}\n\nUse this address?`,
    );
    if (!confirmed) throw new Error('Review the mailing address, then submit again.');
  }
  return suggested;
}
