import { describe, expect, it, vi } from 'vitest';

import {
  type ResolvedProfiles,
  canonicalDirectiveForTarget,
  getByPath,
  isExcludedFromProfileFormSync,
  normalizeDateLikeValue,
  resolveDirectiveFromProfiles,
  resolveDirectiveFromProfilesForTarget,
} from './directives';

const profiles: ResolvedProfiles = {
  client: {
    currentName: { first: 'Ada', middle: 'Byron', last: 'Lovelace', suffix: 'Countess' },
    firstName: 'Ada',
    lastName: 'Lovelace',
    fatherName: { first: 'Lord', middle: 'Noel', last: 'Byron' },
    motherName: {
      first: 'Anne',
      middle: 'Isabella',
      last: 'Byron',
      maiden: 'Milbanke',
    },
    birthDate: '1815-12-10',
    email: 'ada@example.org',
    sex: 'F',
    phoneBook: [{ phoneNumber: '+1 (215) 555-0199' }],
    personalAddress: {
      line1: '12 Analytical Engine Way',
      line2: 'Suite 34',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19104',
    },
    mailAddress: {
      line1: 'PO Box 42',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15213',
    },
  },
  worker: {
    currentName: { first: 'Grace', last: 'Hopper' },
    birthDate: '12-09-1906',
    phoneBook: [{ phoneNumber: '267-555-0102' }],
  },
  director: {
    currentName: { first: 'Katherine', middle: 'G', last: 'Johnson' },
    birthDate: '1918-08-26',
    email: 'kj@example.org',
    phone: '+1 484 555 0103',
    personalAddress: {
      line1: '101 Orbit Rd',
      city: 'Hampton',
      state: 'VA',
      zip: '23666',
    },
  },
  org: {
    name: 'Demo Org',
    email: 'hello@demo.org',
    phone: '+1 215 555 1000',
    address: {
      line1: '100 Main St',
      line2: 'Floor 2',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19107',
      county: 'Philadelphia',
    },
    creationDate: '2024-01-31',
  },
};

describe('directive resolution', () => {
  it('supports direct nested and flattened profile paths', () => {
    expect(getByPath({ 'currentName.first': 'Flat', currentName: { first: 'Nested' } }, 'currentName.first')).toBe('Flat');
    expect(resolveDirectiveFromProfiles('client.currentName.first', profiles)).toBe('Ada');
    expect(resolveDirectiveFromProfiles('client.fatherName.middle', profiles)).toBe('Noel');
    expect(resolveDirectiveFromProfiles('client.motherName.last', profiles)).toBe('Byron');
    expect(resolveDirectiveFromProfiles('client.motherName.maiden', profiles)).toBe('Milbanke');
    expect(resolveDirectiveFromProfiles('dummy:client.motherName.maiden', profiles)).toBe('Milbanke');
    expect(resolveDirectiveFromProfiles('worker.currentName.last', profiles)).toBe('Hopper');
    expect(resolveDirectiveFromProfiles('director.email', profiles)).toBe('kj@example.org');
  });

  it('does not use mother married last name for mother maiden targets', () => {
    expect(canonicalDirectiveForTarget('client.motherName.last', "Mother's maiden name"))
      .toBe('client.motherName.maiden');
    expect(canonicalDirectiveForTarget('dummy:client.motherName.last', 'Mother maiden last'))
      .toBe('dummy:client.motherName.maiden');
    expect(resolveDirectiveFromProfilesForTarget(
      'client.motherName.last',
      profiles,
      "Mother's Maiden Name",
    )).toBe('Milbanke');
    expect(resolveDirectiveFromProfilesForTarget(
      'client.motherName.last',
      profiles,
      "Mother's current last name",
    )).toBe('Byron');
  });

  it('normalizes date-like direct values', () => {
    expect(normalizeDateLikeValue('2024-01-31')).toBe('01/31/2024');
    expect(normalizeDateLikeValue('01-31-2024')).toBe('01/31/2024');
    expect(resolveDirectiveFromProfiles('client.birthDate', profiles)).toBe('12/10/1815');
    expect(resolveDirectiveFromProfiles('org.creationDate', profiles)).toBe('01/31/2024');
  });

  it('supports computed birth date directives', () => {
    expect(resolveDirectiveFromProfiles('client.$dob_mm/dd/yyyy', profiles)).toBe('12/10/1815');
    expect(resolveDirectiveFromProfiles('worker.$dob_mm/dd/yyyy', profiles)).toBe('12/09/1906');
    expect(resolveDirectiveFromProfiles('director.$dob_mm/dd/yyyy', profiles)).toBe('08/26/1918');
    expect(resolveDirectiveFromProfiles('client.$birthYear', profiles)).toBe('1815');
    expect(resolveDirectiveFromProfiles('client.$birthMonth', profiles)).toBe('12');
    expect(resolveDirectiveFromProfiles('client.$dobMonthNumber', profiles)).toBe('12');
    expect(resolveDirectiveFromProfiles('client.$birthDay', profiles)).toBe('10');
  });

  it('supports age and current date directives', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 2));

    expect(resolveDirectiveFromProfiles('client.$age', profiles)).toBe('210');
    expect(resolveDirectiveFromProfiles('director.$age', profiles)).toBe('107');
    expect(resolveDirectiveFromProfiles('anyDate', profiles)).toBe('06/02/2026');
    expect(resolveDirectiveFromProfiles('currentDate', profiles)).toBe('06/02/2026');
    expect(resolveDirectiveFromProfiles('client.$date', profiles)).toBe('06/02/2026');
    expect(resolveDirectiveFromProfiles('org.$date', profiles)).toBe('06/02/2026');

    vi.useRealTimers();
  });

  it('supports full-name, phone, and phone-part directives', () => {
    expect(resolveDirectiveFromProfiles('client.$fullName', profiles)).toBe('Ada Byron Lovelace Countess');
    expect(resolveDirectiveFromProfiles('worker.$fullName', profiles)).toBe('Grace Hopper');
    expect(resolveDirectiveFromProfiles('director.$fullName', profiles)).toBe('Katherine G Johnson');
    expect(resolveDirectiveFromProfiles('client.$phoneLast7', profiles)).toBe('555-0199');
    expect(resolveDirectiveFromProfiles('client.$phoneLastSeven', profiles)).toBe('555-0199');
    expect(resolveDirectiveFromProfiles('client.$primaryPhoneLast7', profiles)).toBe('555-0199');
    expect(resolveDirectiveFromProfiles('client.$primaryPhoneNumber', profiles)).toBe('555-0199');
    expect(resolveDirectiveFromProfiles('client.primaryPhoneLocalNumber', profiles)).toBe('555-0199');
    expect(resolveDirectiveFromProfiles('worker.$phoneLast7', profiles)).toBe('555-0102');
    expect(resolveDirectiveFromProfiles('director.$phoneLast7', profiles)).toBe('555-0103');
    expect(resolveDirectiveFromProfiles('client.$primaryPhoneAreaCode', profiles)).toBe('215');
    expect(resolveDirectiveFromProfiles('client.$primaryPhoneTelephonePrefix', profiles)).toBe('555');
    expect(resolveDirectiveFromProfiles('client.$primaryPhoneLineNumber', profiles)).toBe('0199');
  });

  it('falls back from current-name directives to canonical name columns', () => {
    const columnOnlyProfiles: ResolvedProfiles = {
      client: {
        firstName: 'Flow',
        lastName: 'Flowcheck',
      },
      worker: {
        firstName: 'Grace',
        lastName: 'Hopper',
      },
      director: {
        firstName: 'Katherine',
        lastName: 'Johnson',
      },
    };

    expect(resolveDirectiveFromProfiles('client.currentName.first', columnOnlyProfiles)).toBe('Flow');
    expect(resolveDirectiveFromProfiles('client.currentName.last', columnOnlyProfiles)).toBe('Flowcheck');
    expect(resolveDirectiveFromProfiles('worker.currentName.first', columnOnlyProfiles)).toBe('Grace');
    expect(resolveDirectiveFromProfiles('director.currentName.last', columnOnlyProfiles)).toBe('Johnson');
  });

  it('supports address and full-address directives', () => {
    expect(resolveDirectiveFromProfiles('client.personalAddress.line1', profiles)).toBe('12 Analytical Engine Way');
    expect(resolveDirectiveFromProfiles('client.$fullPersonalAddress', profiles)).toBe(
      '12 Analytical Engine Way, Suite 34, Philadelphia, PA 19104',
    );
    expect(resolveDirectiveFromProfiles('client.$fullMailAddress', profiles)).toBe('PO Box 42, Pittsburgh, PA 15213');
    expect(resolveDirectiveFromProfiles('org.$fullAddress', profiles)).toBe('100 Main St, Floor 2, Philadelphia, PA 19107');
    expect(resolveDirectiveFromProfiles('address.$line1+2', profiles)).toBe('12 Analytical Engine Way, Suite 34');
    expect(resolveDirectiveFromProfiles('org.address.$line1+2', profiles)).toBe('100 Main St, Floor 2');
  });

  it('supports legacy org directive aliases', () => {
    expect(resolveDirectiveFromProfiles('org.organizationName', profiles)).toBe('Demo Org');
    expect(resolveDirectiveFromProfiles('org.phoneNumber', profiles)).toBe('+1 215 555 1000');
    expect(resolveDirectiveFromProfiles('org.email', profiles)).toBe('hello@demo.org');
    expect(resolveDirectiveFromProfiles('org.address.county', profiles)).toBe('Philadelphia');
  });

  it('does not resolve non-value sentinel directives', () => {
    expect(resolveDirectiveFromProfiles('signature', profiles)).toBeUndefined();
    expect(resolveDirectiveFromProfiles('+<fieldId>', profiles)).toBeUndefined();
    expect(resolveDirectiveFromProfiles('-<fieldId>', profiles)).toBeUndefined();
  });

  it('excludes legal-name and birth-date directives from profile sync', () => {
    expect(isExcludedFromProfileFormSync('client.birthDate')).toBe(true);
    expect(isExcludedFromProfileFormSync('client.currentName.first')).toBe(true);
    expect(isExcludedFromProfileFormSync('client.nameHistory.0.first')).toBe(true);
    expect(isExcludedFromProfileFormSync('client.fatherName.first')).toBe(false);
  });
});
