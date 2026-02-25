import React, { useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';
import type { AddressObj, NameObj, ProfileData } from './ProfilePage';

type Props = {
  profile: ProfileData;
  targetUsername?: string;
  onSaved?: () => void;
};

const EMPTY_ADDRESS: AddressObj = { line1: '', line2: '', city: '', state: '', zip: '', county: '' };
const EMPTY_NAME: NameObj = { first: '', middle: '', last: '', suffix: '', maiden: '' };

const SEX_OPTIONS = ['Male', 'Female'] as const;

function nameToDisplay(n?: NameObj): string {
  if (!n) return '';
  const parts = [n.first, n.middle, n.last].filter(Boolean);
  if (n.suffix) parts.push(n.suffix);
  const base = parts.join(' ');
  if (n.maiden) return `${base} (née ${n.maiden})`;
  return base;
}

function addressToDisplay(a?: AddressObj): string {
  if (!a) return '';
  return [a.line1, a.line2, a.city, a.state, a.zip, a.county].filter(Boolean).join(', ');
}

function nameEqual(a: NameObj, b: NameObj): boolean {
  return (a.first || '') === (b.first || '')
    && (a.middle || '') === (b.middle || '')
    && (a.last || '') === (b.last || '')
    && (a.suffix || '') === (b.suffix || '')
    && (a.maiden || '') === (b.maiden || '');
}

function addrEqual(a: AddressObj, b: AddressObj): boolean {
  return (a.line1 || '') === (b.line1 || '')
    && (a.line2 || '') === (b.line2 || '')
    && (a.city || '') === (b.city || '')
    && (a.state || '') === (b.state || '')
    && (a.zip || '') === (b.zip || '')
    && (a.county || '') === (b.county || '');
}

function toAddr(a?: AddressObj): AddressObj {
  return { ...EMPTY_ADDRESS, ...a };
}

function toName(n?: NameObj): NameObj {
  return { ...EMPTY_NAME, ...n };
}

function nameHistoryEqual(a: NameObj[], b: NameObj[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((n, i) => nameEqual(n, b[i]));
}

export default function SavedApplicationInfoSection({
  profile,
  targetUsername,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(() => ({
    currentName: toName(profile.currentName),
    sex: profile.sex || '',
    personalAddress: toAddr(profile.personalAddress),
    mailAddress: toAddr(profile.mailAddress),
    motherName: toName(profile.motherName),
    fatherName: toName(profile.fatherName),
    nameHistory: (profile.nameHistory || []).map(toName),
  }), [profile]);

  const [currentName, setCurrentName] = useState(initial.currentName);
  const [sex, setSex] = useState(initial.sex);
  const [personalAddress, setPersonalAddress] = useState(initial.personalAddress);
  const [mailAddress, setMailAddress] = useState(initial.mailAddress);
  const [motherName, setMotherName] = useState(initial.motherName);
  const [fatherName, setFatherName] = useState(initial.fatherName);
  const [nameHistory, setNameHistory] = useState(initial.nameHistory);

  const currentNameDirty = useMemo(() => (
    (currentName.middle || '') !== (initial.currentName.middle || '')
    || (currentName.suffix || '') !== (initial.currentName.suffix || '')
    || (currentName.maiden || '') !== (initial.currentName.maiden || '')
  ), [currentName, initial.currentName]);

  const isDirty = useMemo(() => (
    currentNameDirty
    || sex !== initial.sex
    || !addrEqual(personalAddress, initial.personalAddress)
    || !addrEqual(mailAddress, initial.mailAddress)
    || !nameEqual(motherName, initial.motherName)
    || !nameEqual(fatherName, initial.fatherName)
    || !nameHistoryEqual(nameHistory, initial.nameHistory)
  ), [currentNameDirty, sex, personalAddress, mailAddress, motherName, fatherName, nameHistory, initial]);

  function reset() {
    setCurrentName(initial.currentName);
    setSex(initial.sex);
    setPersonalAddress(initial.personalAddress);
    setMailAddress(initial.mailAddress);
    setMotherName(initial.motherName);
    setFatherName(initial.fatherName);
    setNameHistory(initial.nameHistory.map((n) => ({ ...n })));
  }

  function beginEdit() {
    reset();
    setIsEditing(true);
  }

  function cancelEdit() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    reset();
    setIsEditing(false);
  }

  function namePayload(n: NameObj): Record<string, string | null> {
    return {
      first: n.first || null,
      middle: n.middle || null,
      last: n.last || null,
      suffix: n.suffix || null,
      maiden: n.maiden || null,
    };
  }

  function addrPayload(a: AddressObj): Record<string, string | null> {
    return {
      line1: a.line1 || null,
      line2: a.line2 || null,
      city: a.city || null,
      state: a.state || null,
      zip: a.zip || null,
      county: a.county || null,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {};

      if (currentNameDirty) {
        payload.currentName = {
          first: initial.currentName.first || null,
          middle: currentName.middle || null,
          last: initial.currentName.last || null,
          suffix: currentName.suffix || null,
          maiden: currentName.maiden || null,
        };
      }
      if (sex !== initial.sex) payload.sex = sex || null;
      if (!addrEqual(personalAddress, initial.personalAddress)) payload.personalAddress = addrPayload(personalAddress);
      if (!addrEqual(mailAddress, initial.mailAddress)) payload.mailAddress = addrPayload(mailAddress);
      if (!nameEqual(motherName, initial.motherName)) payload.motherName = namePayload(motherName);
      if (!nameEqual(fatherName, initial.fatherName)) payload.fatherName = namePayload(fatherName);
      if (!nameHistoryEqual(nameHistory, initial.nameHistory)) {
        payload.nameHistory = nameHistory.map(namePayload);
      }

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      if (targetUsername) payload.username = targetUsername;

      const res = await fetch(`${getServerURL()}/update-user-profile`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json?.status === 'SUCCESS') {
        alert.show('Saved application information');
        setIsEditing(false);
        onSaved?.();
      } else {
        alert.show(`Failed to save: ${json?.message || json?.status || 'Unknown error'}`, { type: 'error' });
      }
    } catch (e: any) {
      alert.show(`Failed to save: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  function renderAddressFields(
    label: string,
    addr: AddressObj,
    setAddr: (a: AddressObj) => void,
  ) {
    return (
      <div className="row tw-mb-5">
        <div className="col-3 card-text mt-2 text-primary-theme">{label}</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <>
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Street address"
                value={addr.line1 || ''}
                onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
              />
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Apt, suite, etc."
                value={addr.line2 || ''}
                onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
              />
              <div className="tw-flex tw-gap-2 tw-mb-1">
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="City"
                  value={addr.city || ''}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  style={{ maxWidth: 100 }}
                  placeholder="State"
                  value={addr.state || ''}
                  onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  style={{ maxWidth: 120 }}
                  placeholder="Zip"
                  value={addr.zip || ''}
                  onChange={(e) => setAddr({ ...addr, zip: e.target.value })}
                />
              </div>
              <input
                type="text"
                className="form-control form-purple"
                placeholder="County (optional)"
                value={addr.county || ''}
                onChange={(e) => setAddr({ ...addr, county: e.target.value })}
              />
            </>
          ) : (
            <div className="tw-pt-2">{addressToDisplay(addr) || <span className="tw-text-gray-400">Not provided</span>}</div>
          )}
        </div>
      </div>
    );
  }

  function renderNameFields(
    label: string,
    n: NameObj,
    setN: (v: NameObj) => void,
    showMaiden = false,
  ) {
    return (
      <div className="row tw-mb-5">
        <div className="col-3 card-text mt-2 text-primary-theme">{label}</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <div className="tw-space-y-1">
              <div className="tw-flex tw-gap-2">
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="First"
                  value={n.first || ''}
                  onChange={(e) => setN({ ...n, first: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="Middle"
                  value={n.middle || ''}
                  onChange={(e) => setN({ ...n, middle: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="Last"
                  value={n.last || ''}
                  onChange={(e) => setN({ ...n, last: e.target.value })}
                />
              </div>
              <div className="tw-flex tw-gap-2">
                <input
                  type="text"
                  className="form-control form-purple"
                  style={{ maxWidth: 160 }}
                  placeholder="Suffix (optional)"
                  value={n.suffix || ''}
                  onChange={(e) => setN({ ...n, suffix: e.target.value })}
                />
                {showMaiden && (
                  <input
                    type="text"
                    className="form-control form-purple"
                    placeholder="Last name before marriage (optional)"
                    value={n.maiden || ''}
                    onChange={(e) => setN({ ...n, maiden: e.target.value })}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="tw-pt-2">{nameToDisplay(n) || <span className="tw-text-gray-400">Not provided</span>}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <div className="tw-flex tw-items-center tw-justify-between">
          <h5 className="card-title tw-mb-0">Saved Application Information</h5>
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

        {/* Full Name -- first & last are read-only, middle/suffix/maiden editable */}
        <div className="row tw-mb-5">
          <div className="col-3 card-text mt-2 text-primary-theme">Full Name</div>
          <div className="col-9 card-text">
            {isEditing ? (
              <div className="tw-space-y-1">
                <div className="tw-flex tw-gap-2">
                  <input
                    type="text"
                    className="form-control form-purple tw-bg-gray-100 tw-text-gray-500"
                    value={currentName.first || ''}
                    disabled
                    placeholder="First"
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    placeholder="Middle"
                    value={currentName.middle || ''}
                    onChange={(e) => setCurrentName({ ...currentName, middle: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control form-purple tw-bg-gray-100 tw-text-gray-500"
                    value={currentName.last || ''}
                    disabled
                    placeholder="Last"
                  />
                </div>
                <div className="tw-flex tw-gap-2">
                  <input
                    type="text"
                    className="form-control form-purple"
                    style={{ maxWidth: 160 }}
                    placeholder="Suffix (optional)"
                    value={currentName.suffix || ''}
                    onChange={(e) => setCurrentName({ ...currentName, suffix: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    placeholder="Maiden name (optional)"
                    value={currentName.maiden || ''}
                    onChange={(e) => setCurrentName({ ...currentName, maiden: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="tw-pt-2">{nameToDisplay(currentName) || <span className="tw-text-gray-400">Not provided</span>}</div>
            )}
          </div>
        </div>

        {/* Sex */}
        <div className="row tw-mb-5">
          <div className="col-3 card-text mt-2 text-primary-theme">Sex</div>
          <div className="col-9 card-text">
            {isEditing ? (
              <select
                className="form-control form-purple"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Select...</option>
                {SEX_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <div className="tw-pt-2">{sex || <span className="tw-text-gray-400">Not provided</span>}</div>
            )}
          </div>
        </div>

        {renderAddressFields('Personal Address', personalAddress, setPersonalAddress)}
        {renderAddressFields('Mailing Address', mailAddress, setMailAddress)}
        {renderNameFields("Mother's Name", motherName, setMotherName, true)}
        {renderNameFields("Father's Name", fatherName, setFatherName, true)}

        {/* Name History */}
        <div className="row tw-mb-5">
          <div className="col-3 card-text mt-2 text-primary-theme">Name History</div>
          <div className="col-9 card-text">
            {isEditing ? (
              <div className="tw-space-y-2">
                {nameHistory.map((entry, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={i} className="tw-flex tw-items-start tw-gap-2">
                    <div className="tw-flex-1 tw-space-y-1">
                      <div className="tw-flex tw-gap-2">
                        <input
                          type="text"
                          className="form-control form-purple"
                          placeholder="First"
                          value={entry.first || ''}
                          onChange={(e) => {
                            const copy = nameHistory.map((n) => ({ ...n }));
                            copy[i].first = e.target.value;
                            setNameHistory(copy);
                          }}
                        />
                        <input
                          type="text"
                          className="form-control form-purple"
                          placeholder="Middle"
                          value={entry.middle || ''}
                          onChange={(e) => {
                            const copy = nameHistory.map((n) => ({ ...n }));
                            copy[i].middle = e.target.value;
                            setNameHistory(copy);
                          }}
                        />
                        <input
                          type="text"
                          className="form-control form-purple"
                          placeholder="Last"
                          value={entry.last || ''}
                          onChange={(e) => {
                            const copy = nameHistory.map((n) => ({ ...n }));
                            copy[i].last = e.target.value;
                            setNameHistory(copy);
                          }}
                        />
                      </div>
                      <div className="tw-flex tw-gap-2">
                        <input
                          type="text"
                          className="form-control form-purple"
                          style={{ maxWidth: 160 }}
                          placeholder="Suffix"
                          value={entry.suffix || ''}
                          onChange={(e) => {
                            const copy = nameHistory.map((n) => ({ ...n }));
                            copy[i].suffix = e.target.value;
                            setNameHistory(copy);
                          }}
                        />
                        <input
                          type="text"
                          className="form-control form-purple"
                          placeholder="Maiden"
                          value={entry.maiden || ''}
                          onChange={(e) => {
                            const copy = nameHistory.map((n) => ({ ...n }));
                            copy[i].maiden = e.target.value;
                            setNameHistory(copy);
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm tw-mt-1"
                      onClick={() => setNameHistory((prev) => prev.filter((_, j) => j !== i))}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => setNameHistory((prev) => [...prev, { ...EMPTY_NAME }])}
                >
                  + Add previous name
                </button>
              </div>
            ) : (
              <div className="tw-pt-2">
                {nameHistory.length === 0
                  ? <span className="tw-text-gray-400">None</span>
                  : nameHistory.map((entry, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={i}>{nameToDisplay(entry)}</div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
