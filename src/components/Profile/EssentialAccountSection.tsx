import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import {
  isValidBirthDate,
  isValidFirstName,
  isValidLastName,
  isValidPhoneNumber,
} from '../../lib/Validations/Validations';
import getServerURL from '../../serverOverride';
import { birthDateStringFromIsoDateOnly } from '../SignUp/SignUp.util';
import type { NameObj, ProfileData } from './ProfilePage';

type PhoneBookEntry = {
  label: string;
  phoneNumber: string;
};

const PRIMARY_LABEL = 'primary';

type Props = {
  profile: ProfileData;
  targetUsername?: string;
  /** Legal name (first/middle/last/suffix); workers may edit a client’s name, etc. */
  canEditName?: boolean;
  /** Birth date; clients cannot edit their own DOB (workers correct it). */
  canEditBirthDate?: boolean;
  onSaved?: () => void;
};

function birthDateApiToIso(api: string | undefined): string {
  if (!api?.trim()) return '';
  const m = api.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[1]}-${m[2]}`;
}

function initialNameFromProfile(profile: ProfileData): NameObj {
  return {
    first: profile.currentName?.first ?? profile.firstName ?? '',
    middle: profile.currentName?.middle ?? '',
    last: profile.currentName?.last ?? profile.lastName ?? '',
    suffix: profile.currentName?.suffix ?? '',
  };
}

function accountNameEqual(a: NameObj, b: NameObj): boolean {
  return (a.first || '') === (b.first || '')
    && (a.middle || '') === (b.middle || '')
    && (a.last || '') === (b.last || '')
    && (a.suffix || '') === (b.suffix || '');
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export default function EssentialAccountSection({
  profile,
  targetUsername,
  canEditName = true,
  canEditBirthDate = true,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingLoginInstructions, setIsSendingLoginInstructions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [identitySnapshot, setIdentitySnapshot] = useState<{
    name: NameObj;
    birthIso: string;
  } | null>(null);
  const [editName, setEditName] = useState<NameObj>(initialNameFromProfile(profile));
  const [editBirthIso, setEditBirthIso] = useState('');

  const initialEmail = profile.email || '';
  const [email, setEmail] = useState(initialEmail);
  const hasEmail = email.trim() !== '';

  const [phoneBook, setPhoneBook] = useState<PhoneBookEntry[]>([]);
  const [phoneBookLoading, setPhoneBookLoading] = useState(true);
  const [editedPhoneBook, setEditedPhoneBook] = useState<PhoneBookEntry[]>([]);
  const [addLabel, setAddLabel] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);

  const buildPayload = useCallback(
    (extra: Record<string, string> = {}): Record<string, string> => {
      const payload: Record<string, string> = { ...extra };
      if (targetUsername) payload.username = targetUsername;
      return payload;
    },
    [targetUsername],
  );

  const fetchPhoneBook = useCallback(async () => {
    setPhoneBookLoading(true);
    try {
      const res = await fetch(`${getServerURL()}/get-phone-book`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json();
      if (json.status === 'SUCCESS' && Array.isArray(json.phoneBook)) {
        setPhoneBook(json.phoneBook);
        setEditedPhoneBook(json.phoneBook.map((e: PhoneBookEntry) => ({ ...e })));
      }
    } catch {
      // silent
    } finally {
      setPhoneBookLoading(false);
    }
  }, [buildPayload]);

  useEffect(() => { fetchPhoneBook(); }, [fetchPhoneBook]);

  const emailDirty = email !== initialEmail;

  const phoneBookDirty = useMemo(() => {
    if (editedPhoneBook.length !== phoneBook.length) return true;
    return editedPhoneBook.some((e, i) => {
      const orig = phoneBook[i];
      return e.label !== orig.label || e.phoneNumber !== orig.phoneNumber;
    });
  }, [editedPhoneBook, phoneBook]);

  const nameDirty = useMemo(() => {
    if (!canEditName || !identitySnapshot) return false;
    return !accountNameEqual(editName, identitySnapshot.name);
  }, [canEditName, identitySnapshot, editName]);

  const birthDirty = useMemo(() => {
    if (!canEditBirthDate || !identitySnapshot) return false;
    return editBirthIso !== identitySnapshot.birthIso;
  }, [canEditBirthDate, identitySnapshot, editBirthIso]);

  const identityDirty = nameDirty || birthDirty;

  const isDirty = emailDirty || phoneBookDirty || showAddRow || identityDirty;

  const name = useMemo(() => {
    const parts = [
      profile.currentName?.first,
      profile.currentName?.middle,
      profile.currentName?.last,
    ].filter(Boolean);
    if (profile.currentName?.suffix) parts.push(profile.currentName.suffix);
    return parts.join(' ') || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }, [profile]);

  // --- phone book API helpers ---

  async function pbPost(endpoint: string, body: Record<string, string>) {
    const res = await fetch(`${getServerURL()}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(body)),
    });
    return res.json();
  }

  async function savePhoneBookChanges(): Promise<boolean> {
    const isFirstEntry = editedPhoneBook.length === 0;
    const resolvedLabel = isFirstEntry ? PRIMARY_LABEL : addLabel.trim();
    if (showAddRow && resolvedLabel && addPhone.trim()) {
      if (!isValidPhoneNumber(addPhone)) {
        alert.show('New phone number is invalid.', { type: 'error' });
        return false;
      }
      const json = await pbPost('/add-phone-book-entry', {
        label: resolvedLabel,
        phoneNumber: addPhone.trim(),
      });
      if (json.status !== 'SUCCESS') {
        alert.show(json.message || 'Failed to add phone number.', { type: 'error' });
        return false;
      }
    }

    const edits = editedPhoneBook
      .map((edited, i) => ({ edited, orig: phoneBook[i] }))
      .filter(({ edited, orig }) => {
        if (!orig) return false;
        return edited.label !== orig.label || edited.phoneNumber !== orig.phoneNumber;
      });

    // eslint-disable-next-line no-restricted-syntax
    for (const { edited, orig } of edits) {
      const labelChanged = edited.label !== orig.label;
      const phoneChanged = edited.phoneNumber !== orig.phoneNumber;

      if (phoneChanged && !isValidPhoneNumber(edited.phoneNumber)) {
        alert.show(`Invalid phone number for "${edited.label}".`, { type: 'error' });
        return false;
      }

      const body: Record<string, string> = { phoneNumber: orig.phoneNumber };
      if (labelChanged) body.newLabel = edited.label;
      if (phoneChanged) body.newPhoneNumber = edited.phoneNumber;

      // eslint-disable-next-line no-await-in-loop
      const json = await pbPost('/update-phone-book-entry', body);
      if (json.status !== 'SUCCESS') {
        alert.show(json.message || `Failed to update "${orig.label}".`, { type: 'error' });
        return false;
      }
    }

    const editedPhones = new Set(editedPhoneBook.map((e) => e.phoneNumber));
    const deletions = phoneBook.filter(
      (orig) => !editedPhones.has(orig.phoneNumber) && orig.label.toLowerCase() !== PRIMARY_LABEL,
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const orig of deletions) {
      // eslint-disable-next-line no-await-in-loop
      const json = await pbPost('/delete-phone-book-entry', { phoneNumber: orig.phoneNumber });
      if (json.status !== 'SUCCESS') {
        alert.show(json.message || `Failed to remove "${orig.label}".`, { type: 'error' });
        return false;
      }
    }

    return true;
  }

  async function saveIdentity(): Promise<boolean> {
    if (!identitySnapshot || !identityDirty) return true;
    const payload: Record<string, unknown> = {};
    if (nameDirty) {
      const f = (editName.first || '').trim();
      const l = (editName.last || '').trim();
      if (!isValidFirstName(f)) {
        alert.show('Please enter a valid first name.', { type: 'error' });
        return false;
      }
      if (!isValidLastName(l)) {
        alert.show('Please enter a valid last name.', { type: 'error' });
        return false;
      }
      payload.currentName = {
        first: f,
        middle: (editName.middle || '').trim() || null,
        last: l,
        suffix: (editName.suffix || '').trim() || null,
      };
    }
    if (birthDirty) {
      if (!editBirthIso.trim()) {
        payload.birthDate = null;
      } else {
        const apiBd = birthDateStringFromIsoDateOnly(editBirthIso);
        if (!apiBd || !isValidBirthDate(apiBd)) {
          alert.show('Please enter a valid birth date.', { type: 'error' });
          return false;
        }
        payload.birthDate = apiBd;
      }
    }
    if (Object.keys(payload).length === 0) return true;
    if (targetUsername) payload.username = targetUsername;

    const res = await fetch(`${getServerURL()}/update-user-profile`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json?.status !== 'SUCCESS') {
      alert.show(`Failed to save name or birth date: ${json?.message || json?.status || 'Unknown error'}`, { type: 'error' });
      return false;
    }
    return true;
  }

  async function saveEmail(): Promise<boolean> {
    if (!emailDirty) return true;
    const payload: Record<string, any> = { email };
    if (targetUsername) payload.username = targetUsername;

    const res = await fetch(`${getServerURL()}/update-user-profile`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json?.status !== 'SUCCESS') {
      alert.show(`Failed to save email: ${json?.message || json?.status || 'Unknown error'}`, { type: 'error' });
      return false;
    }
    return true;
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (!(await saveIdentity())) return;
      if (!(await saveEmail())) return;

      const hasNewEntry = showAddRow && addPhone.trim() && (editedPhoneBook.length === 0 || addLabel.trim());
      if (phoneBookDirty || hasNewEntry) {
        if (!(await savePhoneBookChanges())) return;
      }

      alert.show('Saved account info');
      setIsEditing(false);
      setIdentitySnapshot(null);
      setShowAddRow(false);
      setAddLabel('');
      setAddPhone('');
      await fetchPhoneBook();
      onSaved?.();
    } catch (e: any) {
      alert.show(`Failed to save: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function sendEmailLoginInstructions() {
    setIsSendingLoginInstructions(true);
    try {
      const payload: Record<string, string> = {};
      if (targetUsername) payload.username = targetUsername;

      const res = await fetch(`${getServerURL()}/send-email-login-instructions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.status === 'SUCCESS') {
        alert.show('Login instructions sent');
      } else if (json?.status === 'EMAIL_DOES_NOT_EXIST') {
        alert.show('No email found for this account.', { type: 'error' });
      } else {
        alert.show(`Failed to send email: ${json?.message || json?.status || 'Unknown error'}`, { type: 'error' });
      }
    } catch (e: any) {
      alert.show(`Failed to send email: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSendingLoginInstructions(false);
    }
  }

  function beginEdit() {
    setEmail(initialEmail);
    setEditedPhoneBook(phoneBook.map((e) => ({ ...e })));
    setShowAddRow(false);
    setAddLabel('');
    setAddPhone('');
    if (canEditName || canEditBirthDate) {
      const snapName = initialNameFromProfile(profile);
      const snapBirth = birthDateApiToIso(profile.birthDate);
      setIdentitySnapshot({ name: { ...snapName }, birthIso: snapBirth });
      if (canEditName) {
        setEditName({ ...snapName });
      }
      if (canEditBirthDate) {
        setEditBirthIso(snapBirth);
      } else {
        setEditBirthIso('');
      }
    } else {
      setIdentitySnapshot(null);
    }
    setIsEditing(true);
  }

  function cancelEdit() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    setEmail(initialEmail);
    setEditedPhoneBook(phoneBook.map((e) => ({ ...e })));
    setShowAddRow(false);
    setAddLabel('');
    setAddPhone('');
    setIdentitySnapshot(null);
    setIsEditing(false);
  }

  function updateEditedEntry(index: number, field: 'label' | 'phoneNumber', value: string) {
    setEditedPhoneBook((prev) => {
      const copy = prev.map((e) => ({ ...e }));
      copy[index][field] = value;
      return copy;
    });
  }

  function removeEditedEntry(index: number) {
    setEditedPhoneBook((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <div className="tw-flex tw-items-center tw-justify-between">
          <h5 className="card-title tw-mb-0">Account Information</h5>
          <div className="tw-flex tw-gap-2">
            {!isEditing && (
              <button type="button" className="btn btn-outline-dark" onClick={beginEdit}>
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button type="button" className="btn btn-outline-dark" onClick={cancelEdit} disabled={isSaving}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving || !isDirty}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        <hr />

        {/* Name */}
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Name</div>
          <div className="col-9 card-text">
            {isEditing && canEditName ? (
              <div className="tw-space-y-2 tw-pt-1">
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  <input
                    type="text"
                    className="form-control form-purple"
                    style={{ minWidth: 120 }}
                    placeholder="First"
                    value={editName.first || ''}
                    onChange={(e) => setEditName({ ...editName, first: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    style={{ minWidth: 100 }}
                    placeholder="Middle"
                    value={editName.middle || ''}
                    onChange={(e) => setEditName({ ...editName, middle: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    style={{ minWidth: 120 }}
                    placeholder="Last"
                    value={editName.last || ''}
                    onChange={(e) => setEditName({ ...editName, last: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    style={{ minWidth: 100, maxWidth: 140 }}
                    placeholder="Suffix"
                    value={editName.suffix || ''}
                    onChange={(e) => setEditName({ ...editName, suffix: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="tw-pt-2">{name}</div>
            )}
          </div>
        </div>

        {/* Birth Date */}
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Birth Date</div>
          <div className="col-9 card-text">
            {isEditing && canEditBirthDate ? (
              <div className="tw-pt-1">
                <input
                  type="date"
                  className="form-control form-purple"
                  style={{ maxWidth: 220 }}
                  value={editBirthIso}
                  onChange={(e) => setEditBirthIso(e.target.value)}
                />
                <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Stored as MM-DD-YYYY. Clear the field to remove the birth date.
                </div>
              </div>
            ) : (
              <div className="tw-pt-2">{profile.birthDate || ''}</div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="row tw-mb-2 tw-mt-1">
          <label htmlFor="email" className="col-3 card-text mt-2 text-primary-theme">Email</label>
          <div className="col-9 card-text">
            {isEditing ? (
              <div className="tw-flex tw-items-start">
                <input
                  id="email"
                  type="text"
                  className="form-control form-purple"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {targetUsername && hasEmail && (
                  <button
                    type="button"
                    className="tw-bg-transparent tw-border-0 tw-p-0 tw-ml-6 tw-text-blue-600 hover:tw-text-blue-700"
                    onClick={sendEmailLoginInstructions}
                    disabled={isSendingLoginInstructions}
                  >
                    {isSendingLoginInstructions ? 'Sending...' : 'Email login instructions'}
                  </button>
                )}
              </div>
            ) : (
              <div className="tw-flex tw-items-baseline">
                <div className="tw-pt-2">{email}</div>
                {targetUsername && hasEmail && (
                  <button
                    type="button"
                    className="tw-bg-transparent tw-border-0 tw-p-0 tw-ml-6 tw-text-blue-600 hover:tw-text-blue-700"
                    onClick={sendEmailLoginInstructions}
                    disabled={isSendingLoginInstructions}
                  >
                    {isSendingLoginInstructions ? 'Sending...' : 'Email login instructions'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phone Book */}
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Phone Numbers</div>
          <div className="col-9 card-text">
            {phoneBookLoading && (
              <div className="tw-pt-2 tw-text-gray-400">Loading...</div>
            )}
            {!phoneBookLoading && isEditing && (
              <div className="tw-space-y-2">
                {editedPhoneBook.map((entry, i) => {
                  const isPrimary = entry.label.toLowerCase() === PRIMARY_LABEL;
                  return (
                    <div key={`${entry.phoneNumber}-${entry.label}`} className="tw-flex tw-items-center tw-gap-2">
                      {isPrimary ? (
                        <span className="form-control form-purple tw-bg-gray-100 tw-text-gray-500" style={{ maxWidth: 160 }}>
                          {entry.label}
                        </span>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-purple"
                          style={{ maxWidth: 160 }}
                          value={entry.label}
                          onChange={(e) => updateEditedEntry(i, 'label', e.target.value)}
                          placeholder="Label"
                        />
                      )}
                      <input
                        type="tel"
                        className="form-control form-purple tw-flex-1"
                        value={entry.phoneNumber}
                        onChange={(e) => updateEditedEntry(i, 'phoneNumber', e.target.value)}
                        placeholder="Phone number"
                      />
                      {!isPrimary && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeEditedEntry(i)}>
                          &times;
                        </button>
                      )}
                    </div>
                  );
                })}

                {showAddRow ? (
                  <div className="tw-flex tw-items-center tw-gap-2">
                    {editedPhoneBook.length === 0 ? (
                      <span className="form-control form-purple tw-bg-gray-100 tw-text-gray-500" style={{ maxWidth: 160 }}>primary</span>
                    ) : (
                      <input
                        type="text"
                        className="form-control form-purple"
                        style={{ maxWidth: 160 }}
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                        placeholder='Label (e.g. "daughter")'
                      />
                    )}
                    <input
                      type="tel"
                      className="form-control form-purple tw-flex-1"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="Phone number"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={() => { setShowAddRow(false); setAddLabel(''); setAddPhone(''); }}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setShowAddRow(true)}>
                    + Add number
                  </button>
                )}
              </div>
            )}
            {!phoneBookLoading && !isEditing && (
              <div>
                {phoneBook.length === 0 ? (
                  <div className="tw-pt-2 tw-text-gray-400">No phone numbers saved</div>
                ) : (
                  phoneBook.map((entry) => (
                    <div key={entry.phoneNumber} className="tw-pt-2 tw-flex tw-items-center tw-gap-2">
                      <span>{formatPhone(entry.phoneNumber)}</span>
                      <span className="tw-text-sm tw-text-gray-500">{entry.label}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
