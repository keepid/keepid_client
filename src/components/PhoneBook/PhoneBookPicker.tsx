import React, { useCallback, useEffect, useState } from 'react';
import { useAlert } from 'react-alert';

import { isValidPhoneNumber } from '../../lib/Validations/Validations';
import getServerURL from '../../serverOverride';

export type PhoneBookEntry = {
  label: string;
  phoneNumber: string;
};

type Props = {
  /** Called when the user selects or adds a phone number. */
  onSelect: (phoneNumber: string) => void;
  /** Currently selected phone number (controlled). */
  value?: string;
  /** Optional target username (for caseworker editing a client). */
  targetUsername?: string;
  /** Extra CSS class on the outer wrapper. */
  className?: string;
};

export default function PhoneBookPicker({
  onSelect,
  value,
  targetUsername,
  className,
}: Props) {
  const alert = useAlert();
  const [entries, setEntries] = useState<PhoneBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchPhoneBook = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload: Record<string, string> = {};
      if (targetUsername) payload.username = targetUsername;

      const res = await fetch(`${getServerURL()}/get-phone-book`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status === 'SUCCESS' && Array.isArray(json.phoneBook)) {
        setEntries(json.phoneBook);
      }
    } catch {
      // silent -- phone book is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [targetUsername]);

  useEffect(() => {
    fetchPhoneBook();
  }, [fetchPhoneBook]);

  function handleDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    if (selected === '__add__') {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
      onSelect(selected);
    }
  }

  async function handleAddEntry() {
    if (!newLabel.trim()) {
      alert.show('Please enter a label.', { type: 'error' });
      return;
    }
    if (!isValidPhoneNumber(newPhone)) {
      alert.show('Please enter a valid 10-digit phone number.', { type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        label: newLabel.trim(),
        phoneNumber: newPhone.trim(),
      };
      if (targetUsername) payload.username = targetUsername;

      const res = await fetch(`${getServerURL()}/add-phone-book-entry`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status === 'SUCCESS' && Array.isArray(json.phoneBook)) {
        setEntries(json.phoneBook);
        onSelect(newPhone.trim());
        setNewLabel('');
        setNewPhone('');
        setShowAddForm(false);
        alert.show('Phone number saved to your phone book.');
      } else {
        alert.show(json.message || 'Could not add phone number.', { type: 'error' });
      }
    } catch {
      alert.show('Failed to save phone number.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <span className="tw-text-sm tw-text-gray-400">Loading phone book...</span>;
  }

  return (
    <div className={className}>
      <select
        className="form-control form-purple"
        value={value || ''}
        onChange={handleDropdownChange}
      >
        <option value="" disabled>
          Select a phone number...
        </option>
        {entries.map((entry) => (
          <option key={entry.phoneNumber} value={entry.phoneNumber}>
            {entry.label}
            {' — '}
            {formatPhoneDisplay(entry.phoneNumber)}
          </option>
        ))}
        <option value="__add__">+ Add a new number</option>
      </select>

      {showAddForm && (
        <div className="tw-mt-2 tw-p-3 tw-border tw-border-gray-200 tw-rounded tw-bg-gray-50">
          <div className="tw-flex tw-gap-2 tw-mb-2">
            <input
              type="text"
              className="form-control form-purple"
              placeholder="Label (e.g. daughter, shelter)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <input
              type="tel"
              className="form-control form-purple"
              placeholder="Phone number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>
          <div className="tw-flex tw-gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddEntry}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Use'}
            </button>
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={() => setShowAddForm(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
