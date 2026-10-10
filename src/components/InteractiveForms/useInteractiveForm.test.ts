import { describe, expect, it, vi } from 'vitest';

import type { ResolvedProfiles } from '../../utils/directives';
import {
  applyAutoFillFields,
  buildTemplateDirectiveValues,
  extractAutoFillDirectiveValues,
} from './InteractiveFormWizard';
import type { AutoFillField } from './types';
import {
  buildFormAnswers,
  buildInitialData,
  extractDirectivesFromUiSchema,
  normalizeTextFieldValues,
} from './useInteractiveForm';

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
    motherName: { first: 'Anne', last: 'Byron', maiden: 'Milbanke' },
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
    firstName: { type: 'string' },
    streetAddress: { type: 'string' },
    emailAddress: { type: 'string', format: 'email' },
    appointmentDate: { type: 'string', format: 'date' },
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

    const prefilled = buildInitialData(uiSchema, resolvedProfiles);
    expect(buildFormAnswers(uiSchema, jsonSchema, prefilled, resolvedProfiles)).toEqual({
      clientFullName: 'Ada Lovelace',
      workerDob: '12/09/1906',
      orgName: 'Demo Org',
      directorPhone: '555-0103',
      today: '06/02/2026',
    });

    vi.useRealTimers();
  });

  it('title-cases free-text renderer answers while preserving email, date, and choice values', () => {
    expect(
      normalizeTextFieldValues(
        {
          firstName: 'daniel',
          streetAddress: '1030 douglas street apt 2b',
          emailAddress: 'daniel@example.com',
          appointmentDate: '2026-07-02',
          choice: 'replacement',
        },
        {
          ...jsonSchema,
          properties: {
            ...jsonSchema.properties,
            choice: { type: 'string', enum: ['replacement', 'original'] },
          },
        },
      ),
    ).toEqual({
      firstName: 'Daniel',
      streetAddress: '1030 Douglas Street Apt 2B',
      emailAddress: 'daniel@example.com',
      appointmentDate: '2026-07-02',
      choice: 'replacement',
    });
  });

  it('preserves compound name casing for forms', () => {
    expect(normalizeTextFieldValues(
      { firstName: "mcpherson o'connor smith-jones children’s hospital" },
      jsonSchema,
    ).firstName).toBe("McPherson O'Connor Smith-Jones Children’s Hospital");
  });

  it('sends title-cased free-text answers to PDF fill fields', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
          options: { pdfField: 'first_name' },
        },
        {
          type: 'Control',
          scope: '#/properties/streetAddress',
          options: { pdfField: 'address_line_1' },
        },
        {
          type: 'Control',
          scope: '#/properties/emailAddress',
          options: { pdfField: 'email' },
        },
      ],
    };

    expect(
      buildFormAnswers(
        uiSchema,
        jsonSchema,
        {
          firstName: 'daniel',
          streetAddress: '1030 douglas street',
          emailAddress: 'daniel@example.com',
        },
        resolvedProfiles,
      ),
    ).toEqual({
      first_name: 'Daniel',
      address_line_1: '1030 Douglas Street',
      email: 'daniel@example.com',
    });
  });

  it('fills a question PDF field from the edited answer, not its profile directive', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
          options: { pdfField: 'first_name', directive: 'client.currentName.first' },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, { firstName: 'grace' }, resolvedProfiles)).toEqual({
      first_name: 'Grace',
    });
  });

  it('leaves a question PDF field empty when its answer is empty, even if the directive resolves', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
          options: { pdfField: 'first_name', directive: 'client.currentName.first' },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, { firstName: '' }, resolvedProfiles)).toEqual({});
    expect(buildFormAnswers(uiSchema, jsonSchema, {}, resolvedProfiles)).toEqual({});
  });

  it('fills a question PDF field from its answer when its PDF directive is unresolved', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
          options: { pdfField: 'unrelated_pdf_field', directive: 'client.missingField' },
        },
      ],
    };

    expect(
      buildFormAnswers(uiSchema, jsonSchema, { firstName: 'Ada' }, resolvedProfiles),
    ).toEqual({ unrelated_pdf_field: 'Ada' });
  });

  it('pre-fills a question from its profile directive, and the PDF takes the answer the user leaves', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
          options: { pdfField: 'first_name', directive: 'client.currentName.first' },
        },
      ],
    };

    expect(buildInitialData(uiSchema, resolvedProfiles)).toEqual({ firstName: 'Ada' });
    expect(buildFormAnswers(uiSchema, jsonSchema, buildInitialData(uiSchema, resolvedProfiles), resolvedProfiles))
      .toEqual({ first_name: 'Ada' });
  });

  it('sends an edited pre-filled answer to profile updates instead of the profile value', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/streetAddress',
          options: { directive: 'client.personalAddress.line1' },
        },
      ],
    };

    expect(extractDirectivesFromUiSchema(uiSchema, { streetAddress: '7 New Street' })).toEqual({
      'client.personalAddress.line1': '7 New Street',
    });
  });

  it('fills a second destination from the question answer, not its directive', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
          options: {
            pdfField: 'first_name',
            conditionalFills: [{ pdfField: 'first_name_2', directive: 'client.currentName.first' }],
          },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, { firstName: 'Grace' }, resolvedProfiles)).toEqual({
      first_name: 'Grace',
      first_name_2: 'Grace',
    });
  });

  it('maps group sub-field answers to their own PDF fields and to the matching second destination', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          label: "Father's name",
          elements: [
            {
              type: 'Control',
              label: 'First',
              scope: '#/properties/fatherFirst',
              options: { pdfField: 'First_4', directive: 'client.fatherName.first' },
            },
            {
              type: 'Control',
              label: 'Last',
              scope: '#/properties/fatherLast',
              options: { pdfField: 'Last_prior', directive: 'client.fatherName.last' },
            },
          ],
          options: {
            conditionalFills: [{ pdfField: 'Current last_2', directive: 'client.fatherName.last' }],
          },
        },
      ],
    };
    const answers = { fatherFirst: 'Grace', fatherLast: 'Byron' };

    expect(buildFormAnswers(uiSchema, jsonSchema, answers, resolvedProfiles)).toEqual({
      First_4: 'Grace',
      Last_prior: 'Byron',
      'Current last_2': 'Byron',
    });
  });

  it('syncs each group sub-field answer to its own profile directive, including the second destination', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          label: "Father's name",
          elements: [
            { type: 'Control', label: 'First', scope: '#/properties/fatherFirst', options: { directive: 'client.fatherName.first' } },
            { type: 'Control', label: 'Last', scope: '#/properties/fatherLast', options: { directive: 'client.fatherName.last' } },
          ],
          options: {
            conditionalFills: [{ pdfField: 'Current last_2', directive: 'client.fatherName.last' }],
          },
        },
      ],
    };

    expect(extractDirectivesFromUiSchema(uiSchema, { fatherFirst: 'Grace', fatherLast: 'Byron' })).toEqual({
      'client.fatherName.first': 'Grace',
      'client.fatherName.last': 'Byron',
    });
  });

  it('keeps a literal group-level fill without reading any sub-field', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          elements: [
            { type: 'Control', scope: '#/properties/fatherFirst', options: { pdfField: 'First_4' } },
          ],
          options: {
            conditionalFills: [{ pdfField: 'Fixed', fillValue: 'Yes' }],
          },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, { fatherFirst: 'Grace' }, resolvedProfiles)).toEqual({
      First_4: 'Grace',
      Fixed: 'Yes',
    });
  });

  it('skips a group-level fill that has no literal value and no sub-field sharing its directive', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          elements: [
            { type: 'Control', scope: '#/properties/fatherFirst', options: { pdfField: 'First_4' } },
          ],
          options: {
            conditionalFills: [
              { pdfField: 'Unmatched', directive: 'client.fatherName.last' },
              { pdfField: 'NullLiteral', fillValue: null },
            ],
          },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, { fatherFirst: 'Grace' }, resolvedProfiles)).toEqual({
      First_4: 'Grace',
    });
  });

  it('does not let a question-less autofill overwrite a PDF field a question answer already filled', () => {
    expect(
      applyAutoFillFields(
        { first_name: 'Grace' },
        [{ pdfFieldName: 'first_name', valueSource: 'directive', value: 'client.currentName.first' }],
        resolvedProfiles as Record<string, unknown>,
      ),
    ).toEqual({ first_name: 'Grace' });
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
      { pdfFieldName: 'fixedDefaultCheckbox', valueSource: 'literal', value: '', fieldType: 'checkbox' },
    ];

    expect(applyAutoFillFields(baseFill, autoFillFields, resolvedProfiles as Record<string, unknown>)).toEqual({
      visibleAnswer: 'Typed by user',
      fixedOrgAddress: '100 Main St, Floor 2, Philadelphia, PA 19107',
      fixedWorkerName: 'Grace Hopper',
      fixedDirectorBirthYear: '1918',
      fixedClientPhoneArea: '215',
      fixedLiteral: 'Static outcome',
      fixedCheckbox: 'Choice2',
      fixedDefaultCheckbox: 'true',
    });
  });

  it('passes fixed auto-fill directives to current document generation', () => {
    const autoFillFields: AutoFillField[] = [{
      pdfFieldName: 'client_dob',
      valueSource: 'directive',
      value: 'client.$dob_month_day_year',
    }];

    expect(
      extractAutoFillDirectiveValues(autoFillFields, resolvedProfiles as Record<string, unknown>),
    ).toEqual({ 'client.$dob_month_day_year': 'December 10, 1815' });
  });

  it('passes the selected client birth date to picker attachment generation', () => {
    expect(
      buildTemplateDirectiveValues(undefined, resolvedProfiles as Record<string, unknown>, {}),
    ).toEqual({ 'client.birthDate': '12/10/1815' });
  });

  it('prefers the birth date entered in the current form over the profile fallback', () => {
    expect(
      buildTemplateDirectiveValues(
        undefined,
        resolvedProfiles as Record<string, unknown>,
        { 'client.birthDate': '1987-01-19' },
      ),
    ).toEqual({ 'client.birthDate': '1987-01-19' });
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

  it('fills mother maiden targets from motherName.maiden even when legacy config points at motherName.last', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          label: "Mother's maiden name",
          scope: '#/properties/motherMaiden',
          options: { pdfField: 'mother_maiden_name', directive: 'client.motherName.last' },
        },
        {
          type: 'Control',
          label: "Mother's current last name",
          scope: '#/properties/motherLast',
          options: { pdfField: 'mother_last_name', directive: 'client.motherName.last' },
        },
      ],
    };

    expect(buildFormAnswers(uiSchema, jsonSchema, buildInitialData(uiSchema, resolvedProfiles), resolvedProfiles)).toEqual({
      mother_maiden_name: 'Milbanke',
      mother_last_name: 'Byron',
    });
  });

  it('fills hidden mother maiden PDF fields from motherName.maiden', () => {
    expect(
      applyAutoFillFields(
        {},
        [{ pdfFieldName: 'mother_maiden_name', valueSource: 'directive', value: 'client.motherName.last' }],
        resolvedProfiles as Record<string, unknown>,
      ),
    ).toEqual({ mother_maiden_name: 'Milbanke' });
  });

  it('syncs mother maiden answers back to motherName.maiden for legacy motherName.last directives', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          label: "Mother's maiden name",
          scope: '#/properties/motherMaiden',
          options: { directive: 'client.motherName.last' },
        },
      ],
    };

    expect(extractDirectivesFromUiSchema(uiSchema, { motherMaiden: 'Milbanke' })).toEqual({
      'client.motherName.maiden': 'Milbanke',
    });
  });

  it('syncs parent-name alias directives back to canonical profile paths', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          label: "Mother's maiden name",
          scope: '#/properties/motherMaiden',
          options: { directive: 'client.mother.name.last' },
        },
        {
          type: 'Control',
          label: "Father's last name",
          scope: '#/properties/fatherLast',
          options: { directive: 'client.father.name.last' },
        },
      ],
    };

    expect(extractDirectivesFromUiSchema(uiSchema, { motherMaiden: 'Milbanke', fatherLast: 'Byron' })).toEqual({
      'client.motherName.maiden': 'Milbanke',
      'client.fatherName.last': 'Byron',
    });
  });

  it('syncs title-cased free-text answers back to profile directives', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          label: 'Street address',
          scope: '#/properties/streetAddress',
          options: { directive: 'client.personalAddress.line1' },
        },
        {
          type: 'Control',
          label: 'Email',
          scope: '#/properties/emailAddress',
          options: { directive: 'client.email' },
        },
      ],
    };

    expect(
      extractDirectivesFromUiSchema(
        uiSchema,
        { streetAddress: '1030 douglas street', emailAddress: 'daniel@example.com' },
        jsonSchema,
      ),
    ).toEqual({
      'client.personalAddress.line1': '1030 Douglas Street',
      'client.email': 'daniel@example.com',
    });
  });

  it('can include identity values for current document generation without profile sync', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [{
        type: 'Control',
        label: 'Date of birth',
        scope: '#/properties/birthDate',
        options: { directive: 'client.birthDate' },
      }],
    };
    const data = { birthDate: '1987-01-19' };
    const schema = {
      type: 'object',
      properties: { birthDate: { type: 'string', format: 'date' } },
    };

    expect(extractDirectivesFromUiSchema(uiSchema, data, schema)).toEqual({});
    expect(
      extractDirectivesFromUiSchema(uiSchema, data, schema, { includeExcluded: true }),
    ).toEqual({ 'client.birthDate': '1987-01-19' });
  });

  it('sends the source birth date for a computed DOB answer', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [{
        type: 'Control',
        label: 'Date of birth',
        scope: '#/properties/birthDate',
        options: { directive: 'client.$dob_month_day_year' },
      }],
    };

    expect(
      extractDirectivesFromUiSchema(
        uiSchema,
        { birthDate: '1987-01-19' },
        { type: 'object', properties: { birthDate: { type: 'string', format: 'date' } } },
        { includeExcluded: true },
      ),
    ).toEqual({ 'client.birthDate': '1987-01-19' });
  });

  it('sends the shared birth date source when the PDF uses numeric DOB formatting', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [{
        type: 'Control',
        label: 'Date of birth',
        scope: '#/properties/birthDate',
        options: { pdfField: 'date_of_birth', directive: 'client.$dob_mm/dd/yyyy' },
      }],
    };

    expect(
      extractDirectivesFromUiSchema(
        uiSchema,
        { birthDate: '1987-01-19' },
        { type: 'object', properties: { birthDate: { type: 'string', format: 'date' } } },
        { includeExcluded: true },
      ),
    ).toEqual({ 'client.birthDate': '1987-01-19' });
  });

  it('extracts directives from active secondary PDF destinations', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [{
        type: 'Control',
        label: 'Date of birth',
        scope: '#/properties/birthDate',
        options: {
          pdfField: 'dob_numeric',
          conditionalFills: [{
            pdfField: 'dob_long',
            directive: 'client.$dob_month_day_year',
          }],
        },
      }],
    };
    const schema = {
      type: 'object',
      properties: { birthDate: { type: 'string', format: 'date' } },
    };

    expect(
      extractDirectivesFromUiSchema(
        uiSchema,
        { birthDate: '1987-01-19' },
        schema,
        { includeExcluded: true },
      ),
    ).toEqual({ 'client.birthDate': '1987-01-19' });
  });

  it('ignores directives from inactive conditional PDF destinations', () => {
    const uiSchema = {
      type: 'VerticalLayout',
      elements: [{
        type: 'Control',
        label: 'Date of birth',
        scope: '#/properties/birthDate',
        options: {
          conditionalFills: [{
            pdfField: 'dob_long',
            directive: 'client.$dob_month_day_year',
            fillCondition: [{ scope: '#/properties/useLongDate', schema: { const: true } }],
          }],
        },
      }],
    };

    expect(
      extractDirectivesFromUiSchema(
        uiSchema,
        { birthDate: '1987-01-19', useLongDate: false },
        undefined,
        { includeExcluded: true },
      ),
    ).toEqual({});
  });
});
