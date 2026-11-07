import { canonicalizePhone, formatPhoneForDisplay } from './phone';

// Temporary presentation masking for the demo. Revert after the demo.
// Keep this at render sites: real names/IDs must still reach navigation and APIs.
export function demoClientName(name?: string | null): string {
  return name?.trim().replace(/\s+/g, ' ').toLowerCase() === 'daniel joo'
    ? name.trim()
    : '********';
}

export function demoClientBirthDate(name: string, birthDate: string): string {
  return demoClientName(name) === '********' ? '**/**/****' : birthDate;
}

export function demoClientPhone(phone?: string | null): string {
  return canonicalizePhone(phone) === '3108179067'
    ? formatPhoneForDisplay(phone)
    : '(***) *** - ****';
}
