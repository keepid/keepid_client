// Shared helpers for composing the "ID pickup" SMS / notification that gets sent
// to a client. Used by both the full Notification Center form
// (IdPickupNotificationForm) and the inline "Upload & notify" flow on the
// documents page so the wording, phone format, and ID-category label stay in
// lockstep.

export const PHONE_REGEX = /^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

export interface OrgAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export const EMPTY_ORG_ADDRESS: OrgAddress = {
  street: '',
  city: '',
  state: '',
  zip: '',
};

export function isValidUSPhone(phone: string): boolean {
  return PHONE_REGEX.test((phone || '').trim());
}

export function toE164US(phone: string): string {
  return `+1${(phone || '').replace(/\D/g, '')}`;
}

const mapIdCategoryToPickupOption = (idCategory?: string): string => {
  const normalized = (idCategory || '').trim().toLowerCase().replace(/_/g, ' ');
  if (!normalized) return '';
  if (normalized === 'birth certificate') return 'Birth Certificate';
  if (normalized === 'social security card') return 'Social Security Card';
  if (normalized.includes('driver') || normalized.includes('photo id')) {
    return 'Photo ID';
  }
  return '';
};

export function formatIdLabel(category?: string): string {
  if (!category || category.toUpperCase() === 'NONE') return '______';
  const mapped = mapIdCategoryToPickupOption(category);
  if (mapped) return mapped;
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatOrgAddress(addr: OrgAddress): string {
  const stateZip = `${addr.state} ${addr.zip}`.trim();
  const parts = [addr.street, addr.city, stateZip].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '[pickup location]';
}

export interface BuildPickupMessageArgs {
  clientName: string;
  workerName: string;
  idCategory?: string;
  orgAddress: OrgAddress;
}

export function buildPickupMessage({
  clientName,
  workerName,
  idCategory,
  orgAddress,
}: BuildPickupMessageArgs): string {
  const idLabel = formatIdLabel(idCategory);
  const address = formatOrgAddress(orgAddress);
  return (
    `Hi ${clientName || '[client]'}, your ${idLabel} is ready for pickup at ${address}.`
    + ` Your case worker ${workerName || '[worker]'} is ready to help with further ID needs.`
    + '\n\nDo not reply to this message.'
  );
}
