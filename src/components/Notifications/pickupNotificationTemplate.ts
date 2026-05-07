// Shared helpers for composing the "ID pickup" SMS / email notification that
// gets sent to a client. Used by both the full Notification Center form
// (IdPickupNotificationForm) and the inline "Upload & notify" flow on the
// documents page so the wording, phone format, ID-category label, and email
// template stay in lockstep.

export const PHONE_REGEX = /^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
// Mirrors the server-side regex in WindmillNotificationClient so client-side
// validation matches what the backend will accept.
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;

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

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test((email || '').trim());
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

// --- Email template ----------------------------------------------------------
//
// Companion to buildPickupMessage. The email is more verbose than the SMS and
// includes a deep link to the client's documents page. Keeping the helpers here
// (next to the SMS builder) so any future copy edits stay in one place.

export interface BuildPickupEmailArgs {
  clientName: string;
  idCategory?: string;
  organizationName?: string;
  orgAddress: OrgAddress;
  /**
   * The client-facing email address the message will be sent to. Used as the
   * "log in with this email" hint inside the body. Optional because the body
   * is still readable without it.
   */
  clientEmail?: string;
  /**
   * Absolute URL the client should visit from the email (e.g.
   * https://keep.id). Should already include the protocol; we
   * don't construct or validate the URL here.
   */
  documentLink: string;
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildPickupEmailSubject(idCategory?: string): string {
  const idLabel = formatIdLabel(idCategory);
  return `Keep.id: Your ${idLabel} has arrived!`;
}

// Combines the org name and address into a single human destination string for
// the email body. Falls back gracefully if either piece is missing.
function formatPickupDestination(organizationName: string | undefined, orgAddress: OrgAddress): string {
  const name = (organizationName || '').trim();
  const address = formatOrgAddress(orgAddress);
  if (name && address && address !== '[pickup location]') return `${name} (${address})`;
  if (name) return name;
  return address;
}

export interface PickupEmailBody {
  text: string;
  html: string;
}

export function buildPickupEmailBody({
  clientName,
  idCategory,
  organizationName,
  orgAddress,
  clientEmail,
  documentLink,
}: BuildPickupEmailArgs): PickupEmailBody {
  const idLabel = formatIdLabel(idCategory);
  const destination = formatPickupDestination(organizationName, orgAddress);
  const greeting = clientName ? `Hi ${clientName},\n\n` : '';
  const loginHint = clientEmail
    ? `When you enter the website, click "Google login" with this email (${clientEmail}).`
    : 'When you enter the website, click "Google login" with the email this message was sent to.';

  const text =
    `${greeting}Your ${idLabel} has arrived to ${destination}. `
    + `You can view it now on ${documentLink}.\n\n`
    + `${loginHint}\n\n`
    + `This digital copy does not replace your physical ${idLabel}. `
    + 'Please come in person to pick it up.\n\n'
    + 'Do not reply to this email.';

  const greetingHtml = clientName ? `<p>Hi ${escapeHtml(clientName)},</p>` : '';
  const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#111;line-height:1.5;font-size:15px;max-width:560px">'
    + `${greetingHtml}`
    + `<p>Your <strong>${escapeHtml(idLabel)}</strong> has arrived to `
    + `<strong>${escapeHtml(destination)}</strong>.</p>`
    + `<p>You can view it now at <a href="${escapeHtml(documentLink)}">${escapeHtml(documentLink)}</a>.</p>`
    + `<p>${escapeHtml(loginHint)}</p>`
    + `<p style="color:#444">This digital copy does not replace your physical ${escapeHtml(idLabel)}. `
    + 'Please come in person to pick it up.</p>'
    + '<p style="color:#888;font-size:13px">Do not reply to this email.</p>'
    + '</div>';

  return { text, html };
}

// Builds the absolute URL clients should visit from the pickup email.
// We intentionally route to the homepage/login entry point instead of deep
// linking to a documents page.
export function buildClientDocumentsUrl(): string {
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://keep.id';
  return origin;
}
