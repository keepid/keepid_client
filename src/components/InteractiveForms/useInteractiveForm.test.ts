import { describe, expect, it, vi } from 'vitest';

import { applyAutoFillFields } from './InteractiveFormWizard';
import { buildFormAnswers } from './useInteractiveForm';
import type { AutoFillField } from './types';
import type { ResolvedProfiles } from '../../utils/directives';

const resolvedProfiles: ResolvedProfiles = {
  client: {
    currentName: { first: 'Ada', last: 'Lovelace' },
    birthDate: '1815-12-10',
    phoneBook: [{ phoneNumber: '+1 215 555 0199' }],
    personalAddress: {
      line1: '12 Analytical Engine Way',
      line2: 'Suite 34',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19104',
    },
  },
  worker: {
    currentName: { first: 'Grace', last: 'Hopper' },
    birthDate: '1906-12-09',
    phoneBook: [{ phoneNumber: '+1 267 555 0102' }],
  },
  director: {
    currentName: { first: 'Katherine', middle: 'G', last: 'Johnson' },
    birthDate: '1918-08-26',
    phone: '+1 484 555 0103',
  },
  org: {
    name: 'Demo Org',
    phone: '+1 215 555 1000',
    email: 'hello@demo.org',
    address: {
      line1: '100 Main St',
      line2: 'Floor 2',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19107',
    },
  },
};

const jsonSchema = {
  type: 'object',
  properties: {
    clientQuestion: { type: 'string' },
    workerQuestion: { type: 'string' },
    orgQuestion: { type: 'string' },
    directorQuestion: { type: 'string' },
    dateQuestion: { type: 'string' },
    literalCheckbox: { type: 'boolean' },
    choice: { type: 'string' },
  },
};

describe('interactive form PDF fill directives', () => {
  it('fills visible PDF annotations from client, worker, org, and director directives', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/clientQuestion',
          options: { pdfField: 'clientFullName', directive: 'client.$fullName' },
        },
        {
          type: 'Control',
          scope: '#/properties/workerQuestion',
          options: { pdfField: 'workerDob', directive: 'worker.$dob_mm/dd/yyyy' },
        },
        {
          type: 'Control',
          scope: '#/properties/orgQuestion',
          options: { pdfField: 'orgName', directive: 'org.organizationName' },
        },
        {
          type: 'Control',
          scope: '#/properties/directorQuestion',
          options: { pdfField: 'directorPhone', directive: 'director.$phoneLast7' },
        },
        {
          type: 'Control',
          scope: '#/properties/dateQuestion',
          options: { pdfField: 'today', directive: 'org.$date' },
        },
      ],
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 2));

    expect(buildFormAnswers(uiSchema, jsonSchema, {}, resolvedProfiles)).toEqual({
      clientFullName: 'Ada Lovelace',
      workerDob: '12/09/1906',
      orgName: 'Demo Org',
      directorPhone: '555-0103',
      today: '06/02/2026',
    });

    vi.useRealTimers();
  });

  it('preserves fixed literal outcomes for boolean and option annotations', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/literalCheckbox',
          options: { pdfField: 'checkboxField', fillValue: 'Yes' },
        },
        {
          type: 'Control',
          scope: '#/properties/choice',
          options: {
            optionMappings: [
              { pdfField: 'choiceField', forOption: 'replacement', fillValue: 'Choice2' },
              { pdfField: 'choiceField', forOption: 'original', fillValue: 'Choice1' },
            ],
          },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, { literalCheckbox: true, choice: 'replacement' }, resolvedProfiles)).toEqual({
      checkboxField: 'Yes',
      choiceField: 'Choice2',
    });
  });

  it('uses directives for fixed auto-filled PDF annotations that are not visible questions', () => {
    const baseFill = { visibleAnswer: 'Typed by user' };
    const autoFillFields: AutoFillField[] = [
      { pdfFieldName: 'fixedOrgAddress', valueSource: 'directive', value: 'org.$fullAddress' },
      { pdfFieldName: 'fixedWorkerName', valueSource: 'directive', value: 'worker.$fullName' },
      { pdfFieldName: 'fixedDirectorBirthYear', valueSource: 'directive', value: 'director.$birthYear' },
      { pdfFieldName: 'fixedClientPhoneArea', valueSource: 'directive', value: 'client.$primaryPhoneAreaCode' },
      { pdfFieldName: 'fixedLiteral', valueSource: 'literal', value: 'Static outcome' },
      { pdfFieldName: 'fixedCheckbox', valueSource: 'literal', value: 'Choice2', fieldType: 'checkbox' },
    ];

    expect(applyAutoFillFields(baseFill, autoFillFields, resolvedProfiles as Record<string, unknown>)).toEqual({
      visibleAnswer: 'Typed by user',
      fixedOrgAddress: '100 Main St, Floor 2, Philadelphia, PA 19107',
      fixedWorkerName: 'Grace Hopper',
      fixedDirectorBirthYear: '1918',
      fixedClientPhoneArea: '215',
      fixedLiteral: 'Static outcome',
      fixedCheckbox: 'Choice2',
    });
  });

  it('does not overwrite fixed auto-fill fields with unresolved directive values', () => {
    expect(
      applyAutoFillFields(
        { existing: 'keep me' },
        [{ pdfFieldName: 'missing', valueSource: 'directive', value: 'worker.missingField' }],
        resolvedProfiles as Record<string, unknown>,
      ),
    ).toEqual({ existing: 'keep me' });
  });
});
