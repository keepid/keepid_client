export const PENNDOT_NUMBER_LENGTH = 8;

export const normalizePennDotNumber = (value: string): string => (
  value.replace(/\D/g, '').slice(0, PENNDOT_NUMBER_LENGTH)
);

export const isValidPennDotNumber = (value: string): boolean => (
  value === '' || /^\d{8}$/.test(value)
);
