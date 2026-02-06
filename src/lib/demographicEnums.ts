/**
 * Race and Citizenship enum constants matching the server's User.UserInformation enums.
 * The API expects enum constant names (e.g. "ASIAN"), but we display human-readable names (e.g. "Asian").
 */

export const RACE_OPTIONS: { value: string; displayName: string }[] = [
  { value: 'NATIVE_HAWAIIAN', displayName: 'Native Hawaiian' },
  { value: 'ALASKA_NATIVE', displayName: 'Alaska Native' },
  { value: 'ASIAN', displayName: 'Asian' },
  { value: 'AMERICAN_INDIAN', displayName: 'American Indian' },
  { value: 'BLACK_AFRICAN_AMERICAN', displayName: 'Black or African American' },
  { value: 'OTHER_PACIFIC_ISLANDER', displayName: 'Other Pacific Islander' },
  { value: 'WHITE', displayName: 'White / Caucasian' },
  { value: 'UNSELECTED', displayName: 'Unselected' },
];

export const CITIZENSHIP_OPTIONS: { value: string; displayName: string }[] = [
  { value: 'US_CITIZEN', displayName: 'U.S. Citizen' },
  { value: 'LEGAL_ALLOWED_WORK', displayName: 'Legal (Allowed to work)' },
  { value: 'LEGAL_NOT_ALLOWED_WORK', displayName: 'Legal (Not allowed to work)' },
  { value: 'OTHER', displayName: 'Other' },
  { value: 'UNSELECTED', displayName: 'Unselected' },
];

export const MARITAL_STATUS_OPTIONS: { value: string; displayName: string }[] = [
  { value: 'SINGLE', displayName: 'Single' },
  { value: 'MARRIED', displayName: 'Married' },
  { value: 'DIVORCED', displayName: 'Divorced' },
  { value: 'WIDOWED', displayName: 'Widowed' },
  { value: 'UNSELECTED', displayName: 'Unselected' },
];

/** Display name -> enum constant. Matches server Race.toString() output. */
const RACE_DISPLAY_TO_ENUM: Record<string, string> = Object.fromEntries(
  RACE_OPTIONS.map((o) => [o.displayName, o.value]),
);

/** Display name -> enum constant. Matches server Citizenship.toString() output. */
const CITIZENSHIP_DISPLAY_TO_ENUM: Record<string, string> = Object.fromEntries(
  CITIZENSHIP_OPTIONS.map((o) => [o.displayName, o.value]),
);

/** Enum constant -> display name. */
const RACE_ENUM_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  RACE_OPTIONS.map((o) => [o.value, o.displayName]),
);

/** Enum constant -> display name. */
const CITIZENSHIP_ENUM_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  CITIZENSHIP_OPTIONS.map((o) => [o.value, o.displayName]),
);

/** Marital status enum constant -> display name. */
const MARITAL_STATUS_ENUM_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  MARITAL_STATUS_OPTIONS.map((o) => [o.value, o.displayName]),
);

/**
 * Converts a race value to the enum constant expected by the API.
 * Accepts either display name (e.g. "Asian") or enum constant (e.g. "ASIAN").
 */
export function toRaceEnumConstant(value: string): string {
  if (!value || !value.trim()) return value;
  const trimmed = value.trim();
  if (RACE_OPTIONS.some((o) => o.value === trimmed)) return trimmed;
  return RACE_DISPLAY_TO_ENUM[trimmed] ?? trimmed;
}

/**
 * Converts a citizenship value to the enum constant expected by the API.
 * Accepts either display name (e.g. "U.S. Citizen") or enum constant (e.g. "US_CITIZEN").
 */
export function toCitizenshipEnumConstant(value: string): string {
  if (!value || !value.trim()) return value;
  const trimmed = value.trim();
  if (CITIZENSHIP_OPTIONS.some((o) => o.value === trimmed)) return trimmed;
  return CITIZENSHIP_DISPLAY_TO_ENUM[trimmed] ?? trimmed;
}

/**
 * Converts a race enum constant to its display name for UI display.
 */
export function toRaceDisplayName(value: string): string {
  if (!value || !value.trim()) return value;
  return RACE_ENUM_TO_DISPLAY[value.trim()] ?? value;
}

/**
 * Converts a citizenship enum constant to its display name for UI display.
 */
export function toCitizenshipDisplayName(value: string): string {
  if (!value || !value.trim()) return value;
  return CITIZENSHIP_ENUM_TO_DISPLAY[value.trim()] ?? value;
}

/**
 * Converts a marital status enum constant to its display name for UI display.
 */
export function toMaritalStatusDisplayName(value: string): string {
  if (!value || !value.trim()) return value;
  return MARITAL_STATUS_ENUM_TO_DISPLAY[value.trim()] ?? value;
}
