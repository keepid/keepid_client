// Display- and storage-side helpers for US phone numbers, kept in sync with
// the server's `PhoneNumbers` utility so the worker landing card, the
// profile phone-book panel, and the picker all render the same value
// regardless of what format the user originally typed.

/**
 * Returns the 10-digit canonical form of `raw`, or `null` if it cannot be
 * parsed into a valid US number. Liberal in what it accepts: digits,
 * dashes, dots, spaces, parens, and an optional leading `+1` or `1`.
 */
export function canonicalizePhone(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const digits = raw.replace(/\D/g, '');
  const stripped = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return stripped.length === 10 ? stripped : null;
}

/**
 * Formats a US phone number as `(XXX) XXX-XXXX` when it can be reduced to
 * 10 canonical digits. Anything we can't parse comes back unchanged so the
 * raw value is at least visible to the user — important during the
 * migration window when legacy rows may still hold non-canonical strings
 * the V9 backfill couldn't salvage.
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (phone == null || phone === '') return '';
  const canonical = canonicalizePhone(phone);
  if (canonical === null) return phone;
  return `(${canonical.slice(0, 3)}) ${canonical.slice(3, 6)}-${canonical.slice(6)}`;
}
