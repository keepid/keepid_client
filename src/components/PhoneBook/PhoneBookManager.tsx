import React, { useCallback, useEffect, useState } from 'react';
import { useAlert } from 'react-alert';

import { isValidPhoneNumber } from '../../lib/Validations/Validations';
import getServerURL from '../../serverOverride';

type PhoneBookEntry = {
  label: string;
  phoneNumber: string;
  isPrimary: boolean;
};

type Props = {
  targetUsername?: string;
  onPhoneBookChanged?: () => void;
};

export default function PhoneBookManager({ targetUsername, onPhoneBookChanged }: Props) {
  const alert = useAlert();
  const [entries, setEntries] = useState<PhoneBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit state (keyed by phone number being edited)
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const buildPayload = useCallback(
    (extra: Record<string, string> = {}): Record<string, string> => {
      const payload: Record<string, string> = { ...extra };
      if (targetUsername) payload.username = targetUsername;
      return payload;
    },
    [targetUsername],
  );

  const fetchPhoneBook = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getServerURL()}/get-phone-book`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json();
      if (json.status === 'SUCCESS' && Array.isArray(json.phoneBook)) {
        setEntries(json.phoneBook);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [buildPayload]);

  useEffect(() => {
    fetchPhoneBook();
  }, [fetchPhoneBook]);

  function applyResult(json: any) {
    if (json.status === 'SUCCESS' && Array.isArray(json.phoneBook)) {
      setEntries(json.phoneBook);
      onPhoneBookChanged?.();
    } else {
      alert.show(json.message || 'Operation failed.', { type: 'error' });
    }
  }

  async function handleAdd() {
    if (!addLabel.trim()) {
      alert.show('Please enter a label.', { type: 'error' });
      return;
    }
    if (!isValidPhoneNumber(addPhone)) {
      alert.show('Please enter a valid phone number.', { type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${getServerURL()}/add-phone-book-entry`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload({ label: addLabel.trim(), phoneNumber: addPhone.trim() })),
      });
      const json = await res.json();
      applyResult(json);
      if (json.status === 'SUCCESS') {
        setAddLabel('');
        setAddPhone('');
        setShowAddForm(false);
      }
    } catch {
      alert.show('Failed to add phone number.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(originalPhone: string) {
    if (!editLabel.trim()) {
      alert.show('Label cannot be empty.', { type: 'error' });
      return;
    }
    if (editPhone.trim() && !isValidPhoneNumber(editPhone)) {
      alert.show('Please enter a valid phone number.', { type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const payload: Record<string, string> = { phoneNumber: originalPhone };
      if (editLabel.trim()) payload.newLabel = editLabel.trim();
      if (editPhone.trim() && editPhone.trim() !== originalPhone) {
        payload.newPhoneNumber = editPhone.trim();
      }
      if (targetUsername) payload.username = targetUsername;

      const res = await fetch(`${getServerURL()}/update-phone-book-entry`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      applyResult(json);
      if (json.status === 'SUCCESS') {
        setEditingPhone(null);
      }
    } catch {
      alert.show('Failed to update phone number.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(phoneNumber: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Remove this phone number from your phone book?')) return;
    try {
      const res = await fetch(`${getServerURL()}/delete-phone-book-entry`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload({ phoneNumber })),
      });
      applyResult(await res.json());
    } catch {
      alert.show('Failed to delete phone number.', { type: 'error' });
    }
  }

  async function handleSetPrimary(phoneNumber: string) {
    try {
      const res = await fetch(`${getServerURL()}/set-primary-phone`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload({ phoneNumber })),
      });
      applyResult(await res.json());
    } catch {
      alert.show('Failed to set primary.', { type: 'error' });
    }
  }

  function startEdit(entry: PhoneBookEntry) {
    setEditingPhone(entry.phoneNumber);
    setEditLabel(entry.label);
    setEditPhone(entry.phoneNumber);
  }

  function cancelEdit() {
    setEditingPhone(null);
  }

  if (isLoading) {
    return (
      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <h5 className="card-title">Phone Book</h5>
          <p className="tw-text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
          <h5 className="card-title tw-mb-0">Phone Book</h5>
          {!showAddForm && (
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              Add number
            </button>
          )}
        </div>

        {entries.length === 0 && !showAddForm && (
          <p className="tw-text-gray-500 tw-text-sm">No phone numbers saved yet.</p>
        )}

        <div className="tw-divide-y tw-divide-gray-100">
          {entries.map((entry) => {
            const isEditing = editingPhone === entry.phoneNumber;
            return (
              <div
                key={entry.phoneNumber}
                className="tw-py-2 tw-flex tw-items-center tw-gap-3"
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="form-control form-purple tw-flex-1"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Label"
                    />
                    <input
                      type="tel"
                      className="form-control form-purple tw-flex-1"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone number"
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdate(entry.phoneNumber)}
                      disabled={isSaving}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={cancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="tw-flex-1">
                      <span className="tw-font-medium">{entry.label}</span>
                      {entry.isPrimary && (
                        <span className="tw-ml-2 tw-text-xs tw-bg-blue-100 tw-text-blue-700 tw-px-1.5 tw-py-0.5 tw-rounded">
                          primary
                        </span>
                      )}
                      <div className="tw-text-sm tw-text-gray-500">
                        {formatPhone(entry.phoneNumber)}
                      </div>
                    </div>
                    <div className="tw-flex tw-gap-1 tw-flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => startEdit(entry)}
                      >
                        Edit
                      </button>
                      {!entry.isPrimary && (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleSetPrimary(entry.phoneNumber)}
                          >
                            Set primary
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(entry.phoneNumber)}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {showAddForm && (
          <div className="tw-mt-3 tw-p-3 tw-border tw-border-gray-200 tw-rounded tw-bg-gray-50">
            <div className="tw-flex tw-gap-2 tw-mb-2">
              <input
                type="text"
                className="form-control form-purple"
                placeholder='Label (e.g. "daughter", "shelter")'
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
              />
              <input
                type="tel"
                className="form-control form-purple"
                placeholder="Phone number"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
              />
            </div>
            <div className="tw-flex tw-gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAdd}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Add'}
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={() => {
                  setShowAddForm(false);
                  setAddLabel('');
                  setAddPhone('');
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
