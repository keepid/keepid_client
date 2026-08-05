export type DisplayAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
};

export function formatCityStateZip(address: DisplayAddress): string {
  const city = address.city?.trim() || '';
  const stateZip = [address.state?.trim(), address.zip?.trim()].filter(Boolean).join(' ');
  return [city, stateZip].filter(Boolean).join(', ');
}

export function formatAddress(
  address: DisplayAddress | undefined,
  options: { multiline?: boolean; includeCounty?: boolean } = {},
): string {
  if (!address) return '';
  const separator = options.multiline ? '\n' : ', ';
  const county = options.includeCounty && address.county?.trim()
    ? `${address.county.trim()} County`
    : '';
  return [
    address.line1?.trim(),
    address.line2?.trim(),
    formatCityStateZip(address),
    county,
  ].filter(Boolean).join(separator);
}
