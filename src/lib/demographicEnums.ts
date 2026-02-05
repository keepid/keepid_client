/**
 * Race and Citizenship enum constants matching the server's OptionalUserInformation enums.
 * The API expects enum constant names (e.g. "ASIAN"), not display names (e.g. "Asian").
 */

export const RACE_ENUM_CONSTANTS = [
  'NATIVE_HAWAIIAN',
  'ALASKA_NATIVE',
  'ASIAN',
  'AMERICAN_INDIAN',
  'BLACK_AFRICAN_AMERICAN',
  'OTHER_PACIFIC_ISLANDER',
  'WHITE',
  'UNSELECTED',
] as const;

export const CITIZENSHIP_ENUM_CONSTANTS = [
  'US_CITIZEN',
  'LEGAL_ALLOWED_WORK',
  'LEGAL_NOT_ALLOWED_WORK',
  'OTHER',
  'UNSELECTED',
] as const;

/** Display name -> enum constant. Matches server Race.toString() output. */
const RACE_DISPLAY_TO_ENUM: Record<string, string> = {
  'Native Hawaiian': 'NATIVE_HAWAIIAN',
  'Alaska Native': 'ALASKA_NATIVE',
  Asian: 'ASIAN',
  'American Indian': 'AMERICAN_INDIAN',
  'Black or African American': 'BLACK_AFRICAN_AMERICAN',
  'Other Pacific Islander': 'OTHER_PACIFIC_ISLANDER',
  'White / Caucasian': 'WHITE',
  Unselected: 'UNSELECTED',
};

/** Display name -> enum constant. Matches server Citizenship.toString() output. */
const CITIZENSHIP_DISPLAY_TO_ENUM: Record<string, string> = {
  'U.S. Citizen': 'US_CITIZEN',
  'Legal (Allowed to work)': 'LEGAL_ALLOWED_WORK',
  'Legal (Not allowed to work)': 'LEGAL_NOT_ALLOWED_WORK',
  Other: 'OTHER',
  Unselected: 'UNSELECTED',
};

/**
 * Converts a race value to the enum constant expected by the API.
 * Accepts either display name (e.g. "Asian") or enum constant (e.g. "ASIAN").
 */
export function toRaceEnumConstant(value: string): string {
  if (!value || !value.trim()) return value;
  const trimmed = value.trim();
  if (RACE_ENUM_CONSTANTS.includes(trimmed as (typeof RACE_ENUM_CONSTANTS)[number])) {
    return trimmed;
  }
  return RACE_DISPLAY_TO_ENUM[trimmed] ?? trimmed;
}

/**
 * Converts a citizenship value to the enum constant expected by the API.
 * Accepts either display name (e.g. "U.S. Citizen") or enum constant (e.g. "US_CITIZEN").
 */
export function toCitizenshipEnumConstant(value: string): string {
  if (!value || !value.trim()) return value;
  const trimmed = value.trim();
  if (CITIZENSHIP_ENUM_CONSTANTS.includes(trimmed as (typeof CITIZENSHIP_ENUM_CONSTANTS)[number])) {
    return trimmed;
  }
  return CITIZENSHIP_DISPLAY_TO_ENUM[trimmed] ?? trimmed;
}
