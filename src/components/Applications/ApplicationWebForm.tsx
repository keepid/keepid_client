import 'react-datepicker/dist/react-datepicker.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import PhoneBookPicker from '../PhoneBook/PhoneBookPicker';

// ----- Types -----

interface Field {
  fieldID: string;
  fieldName: string;
  fieldType: string;
  fieldValueOptions: string[];
  fieldDefaultValue: any;
  fieldIsRequired: boolean;
  fieldNumLines: number;
  fieldIsMatched: boolean;
  fieldQuestion: string;
}

interface ApplicationWebFormProps {
  applicationId: string;
  clientUsername?: string;
  onSubmit: (formAnswers: Record<string, any>) => void;
}

type FormAnswers = Record<string, any>;

const MAX_Q_PER_PAGE = 10;

// ----- Helper: date -> MM/DD/YYYY string -----

function toDateString(date: Date): string {
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return [
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd,
    date.getFullYear(),
  ].join('/');
}

/**
 * If a string is ALL CAPS and contains only letters/spaces, convert to Title Case.
 * Leaves mixed-case, numeric, or short (<=2 char) strings unchanged (e.g. "PA", "19104").
 */
function normalizeIfAllCaps(value: string): string {
  if (!value || value.length <= 2) return value;
  // Only normalize strings that are strictly all uppercase letters (with optional spaces/hyphens)
  if (/^[A-Z][A-Z\s-]+$/.test(value)) {
    return value
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
  }
  return value;
}

// ----- Component -----

export default function ApplicationWebForm({
  applicationId,
  clientUsername = '',
  onSubmit,
}: ApplicationWebFormProps) {
  const [fields, setFields] = useState<Field[] | null>(null);
  const [formAnswers, setFormAnswers] = useState<FormAnswers>({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const numPages = useMemo(
    () => (fields ? Math.max(1, Math.ceil(fields.length / MAX_Q_PER_PAGE)) : 1),
    [fields],
  );

  // ----- Fetch questions on mount -----

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${getServerURL()}/get-questions-2`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ applicationId, clientUsername }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'SUCCESS') {
          const loadedFields: Field[] = json.fields.map((f: any) => ({
            ...f,
            fieldID: uuid(),
          }));

          // Initialize answers from defaults, normalizing ALL CAPS values to Title Case
          const initialAnswers: FormAnswers = {};
          loadedFields.forEach((f) => {
            if (f.fieldType.toLowerCase() === 'datefield' && f.fieldIsMatched) {
              initialAnswers[f.fieldName] = new Date();
            } else {
              const raw = f.fieldDefaultValue ?? '';
              initialAnswers[f.fieldName] = typeof raw === 'string' ? normalizeIfAllCaps(raw) : raw;
            }
          });

          setFields(loadedFields);
          setFormAnswers(initialAnswers);
          setTitle(json.title || '');
          setDescription(json.description || '');
        } else {
          setError('Failed to load form questions.');
        }
      })
      .catch(() => setError('Failed to connect to server.'))
      .finally(() => setLoading(false));
  }, [applicationId, clientUsername]);

  // ----- Change handlers -----

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { id, value } = e.target;
      setFormAnswers((prev) => ({ ...prev, [id]: value }));
      setValidationErrors((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [],
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, checked } = e.target;
      setFormAnswers((prev) => ({ ...prev, [id]: checked }));
    },
    [],
  );

  const handleRadioChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormAnswers((prev) => ({ ...prev, [name]: value }));
      setValidationErrors((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    },
    [],
  );

  const handleListChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
      setFormAnswers((prev) => ({ ...prev, [e.target.id]: values }));
    },
    [],
  );

  const handleDateChange = useCallback(
    (date: Date | null, fieldName: string) => {
      setFormAnswers((prev) => ({ ...prev, [fieldName]: date }));
    },
    [],
  );

  // ----- Validation -----

  const validate = useCallback((): boolean => {
    if (!fields) return false;
    const errors = new Set<string>();
    fields.forEach((f) => {
      if (f.fieldIsRequired) {
        const val = formAnswers[f.fieldName];
        if (val === undefined || val === null || val === '' || val === 'Off' || val === 'false') {
          errors.add(f.fieldName);
        }
      }
    });
    setValidationErrors(errors);
    return errors.size === 0;
  }, [fields, formAnswers]);

  // ----- Submit -----

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate() || !fields) return;

      // Convert dates to strings for the backend
      const finalAnswers: FormAnswers = { ...formAnswers };
      fields.forEach((f) => {
        if (f.fieldType.toLowerCase() === 'datefield' && finalAnswers[f.fieldName] instanceof Date) {
          finalAnswers[f.fieldName] = toDateString(finalAnswers[f.fieldName]);
        }
      });

      setSubmitting(true);
      onSubmit(finalAnswers);
    },
    [fields, formAnswers, onSubmit, validate],
  );

  // ----- Field renderers -----

  const renderTextField = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label htmlFor={entry.fieldName} className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || entry.fieldName}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      <input
        type="text"
        className={`form-control ${validationErrors.has(entry.fieldName) ? 'is-invalid' : ''}`}
        id={entry.fieldName}
        onChange={handleTextChange}
        value={formAnswers[entry.fieldName] ?? ''}
        required={entry.fieldIsRequired}
      />
      {validationErrors.has(entry.fieldName) && (
        <small className="text-danger">This field is required.</small>
      )}
    </div>
  );

  const renderMultilineTextField = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label htmlFor={entry.fieldName} className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || entry.fieldName}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      <textarea
        className={`form-control ${validationErrors.has(entry.fieldName) ? 'is-invalid' : ''}`}
        id={entry.fieldName}
        placeholder={entry.fieldQuestion || entry.fieldName}
        onChange={handleTextChange}
        value={formAnswers[entry.fieldName] ?? ''}
        required={entry.fieldIsRequired}
        rows={entry.fieldNumLines || 3}
      />
      {validationErrors.has(entry.fieldName) && (
        <small className="text-danger">This field is required.</small>
      )}
    </div>
  );

  const renderCheckBox = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <div className="custom-control custom-checkbox">
        <input
          type="checkbox"
          className="custom-control-input"
          id={entry.fieldName}
          onChange={handleCheckboxChange}
          checked={!!formAnswers[entry.fieldName]}
          required={entry.fieldIsRequired}
        />
        <label className="custom-control-label" htmlFor={entry.fieldName}>
          {entry.fieldQuestion || entry.fieldName}
          {entry.fieldIsRequired && <span className="text-danger"> *</span>}
        </label>
      </div>
    </div>
  );

  const renderRadioButton = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || entry.fieldName}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      {entry.fieldValueOptions.map((value) => (
        <div className="custom-control custom-radio" key={`${entry.fieldName}_${value}`}>
          <input
            type="radio"
            className="custom-control-input"
            id={`${entry.fieldName}_${value}`}
            name={entry.fieldName}
            checked={formAnswers[entry.fieldName] === value}
            value={value}
            onChange={handleRadioChange}
            required={entry.fieldIsRequired}
          />
          <label className="custom-control-label" htmlFor={`${entry.fieldName}_${value}`}>
            {value}
          </label>
        </div>
      ))}
      {validationErrors.has(entry.fieldName) && (
        <small className="text-danger">This field is required.</small>
      )}
    </div>
  );

  const renderComboBox = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label htmlFor={entry.fieldName} className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || entry.fieldName}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      <select
        id={entry.fieldName}
        onChange={handleTextChange}
        className={`custom-select ${validationErrors.has(entry.fieldName) ? 'is-invalid' : ''}`}
        value={formAnswers[entry.fieldName] ?? ''}
        required={entry.fieldIsRequired}
      >
        <option value="" disabled>
          Select...
        </option>
        {entry.fieldValueOptions.map((value) => (
          <option value={value} key={`${entry.fieldName}_${value}`}>
            {value}
          </option>
        ))}
      </select>
      {validationErrors.has(entry.fieldName) && (
        <small className="text-danger">This field is required.</small>
      )}
    </div>
  );

  const renderListBox = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label htmlFor={entry.fieldName} className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || entry.fieldName}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      <select
        id={entry.fieldName}
        onChange={handleListChange}
        className="custom-select"
        multiple
        required={entry.fieldIsRequired}
      >
        <option value="" disabled>
          Select...
        </option>
        {entry.fieldValueOptions.map((value) => (
          <option value={value} key={`${entry.fieldName}_${value}`}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );

  const renderDateField = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label htmlFor={entry.fieldName} className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || 'Date'}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      <DatePicker
        id={entry.fieldName}
        selected={
          formAnswers[entry.fieldName]
            ? new Date(formAnswers[entry.fieldName])
            : new Date()
        }
        onChange={(date) => handleDateChange(date, entry.fieldName)}
        className="form-control"
        required={entry.fieldIsRequired}
      />
    </div>
  );

  const isPhoneField = (entry: Field): boolean => {
    const name = (entry.fieldName || '').toLowerCase();
    const question = (entry.fieldQuestion || '').toLowerCase();
    const combined = `${name} ${question}`;
    return /phone|telephone|cell|mobile/.test(combined)
      && !/fax/.test(combined);
  };

  const renderPhoneBookField = (entry: Field) => (
    <div className="tw-mb-4" key={entry.fieldID}>
      <label htmlFor={entry.fieldName} className="tw-block tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
        {entry.fieldQuestion || entry.fieldName}
        {entry.fieldIsRequired && <span className="text-danger"> *</span>}
      </label>
      <PhoneBookPicker
        value={formAnswers[entry.fieldName] ?? ''}
        targetUsername={clientUsername || undefined}
        onSelect={(phone) => {
          setFormAnswers((prev) => ({ ...prev, [entry.fieldName]: phone }));
          setValidationErrors((prev) => {
            const next = new Set(prev);
            next.delete(entry.fieldName);
            return next;
          });
        }}
      />
      {validationErrors.has(entry.fieldName) && (
        <small className="text-danger">This field is required.</small>
      )}
    </div>
  );

  const renderField = (entry: Field) => {
    const type = entry.fieldType.toLowerCase();
    switch (type) {
      case 'textfield':
        return isPhoneField(entry) ? renderPhoneBookField(entry) : renderTextField(entry);
      case 'multilinetextfield':
        return renderMultilineTextField(entry);
      case 'checkbox':
        return renderCheckBox(entry);
      case 'radiobutton':
        return renderRadioButton(entry);
      case 'combobox':
        return renderComboBox(entry);
      case 'listbox':
        return renderListBox(entry);
      case 'datefield':
        return renderDateField(entry);
      case 'readonlyfield':
        // Read-only fields are not rendered as interactive form elements
        return null;
      case 'signature':
        // Signatures handled in the send step, not here
        return null;
      default:
        return null;
    }
  };

  // ----- Pagination -----

  const qStartIndex = (currentPage - 1) * MAX_Q_PER_PAGE;
  const progressPercent = numPages > 0 ? (currentPage / numPages) * 100 : 100;

  // ----- Render -----

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading form...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center">
        <p className="text-danger">{error}</p>
        <Button variant="primary" className="mt-3" onClick={() => onSubmit({})}>
          Continue without form
        </Button>
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="p-5 text-center">
        <p>No form questions found for this application.</p>
        <Button variant="primary" className="mt-3" onClick={() => onSubmit({})}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div>
      {(title || description) && (
        <div className="tw-mb-5 tw-border-b tw-border-gray-200 tw-pb-4">
          {title && <h4 className="tw-font-semibold tw-mb-1">{title}</h4>}
          {description && <p className="tw-text-sm tw-text-gray-500 tw-mb-0">{description}</p>}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        {fields.map((entry, index) => {
          if (index < qStartIndex || index >= qStartIndex + MAX_Q_PER_PAGE) return null;
          return <div key={entry.fieldID}>{renderField(entry)}</div>;
        })}

        <div className="tw-flex tw-justify-between tw-items-center tw-mt-8 tw-pt-4 tw-border-t tw-border-gray-200">
          <div>
            {currentPage > 1 && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setCurrentPage((p) => p - 1);
                  window.scrollTo(0, 0);
                }}
              >
                Previous
              </Button>
            )}
          </div>

          <span className="tw-text-sm tw-text-gray-400">
            Page {currentPage} of {numPages}
          </span>

          <div>
            {currentPage < numPages ? (
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  window.scrollTo(0, 0);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}
