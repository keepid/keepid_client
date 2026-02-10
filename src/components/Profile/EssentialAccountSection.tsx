import React, { useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

type Props = {
  profile: {
    username?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  targetUsername?: string;
  onSaved?: () => void;
};

export default function EssentialAccountSection({
  profile,
  targetUsername,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initial = useMemo(
    () => ({
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipcode: profile.zipcode || '',
    }),
    [profile.address, profile.city, profile.email, profile.phone, profile.state, profile.zipcode],
  );

  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [city, setCity] = useState(initial.city);
  const [state, setState] = useState(initial.state);
  const [zipcode, setZipcode] = useState(initial.zipcode);

  const isDirty = useMemo(() => (
    email !== initial.email
    || phone !== initial.phone
    || address !== initial.address
    || city !== initial.city
    || state !== initial.state
    || zipcode !== initial.zipcode
  ), [address, city, email, initial, phone, state, zipcode]);

  const name = useMemo(() => {
    const fn = profile.firstName || '';
    const ln = profile.lastName || '';
    return `${fn} ${ln}`.trim();
  }, [profile.firstName, profile.lastName]);

  async function saveRootFields() {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {};

      // Only send fields that actually changed so we don't trigger validation
      // errors on untouched/empty fields (like phone).
      if (email !== initial.email) {
        payload.email = email;
      }
      if (phone !== initial.phone) {
        payload.phone = phone;
      }
      if (address !== initial.address) {
        payload.address = address;
      }
      if (city !== initial.city) {
        payload.city = city;
      }
      if (state !== initial.state) {
        payload.state = state;
      }
      if (zipcode !== initial.zipcode) {
        payload.zipcode = zipcode;
      }

      if (Object.keys(payload).length === 0) {
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      // If we’re editing a target user (Batch 8), include username.
      if (targetUsername) {
        payload.username = targetUsername;
      }

      const res = await fetch(`${getServerURL()}/update-user-profile`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        // Non-JSON response (e.g., 404 Not found)
        alert.show(`Failed to save: ${text || res.statusText || 'Unknown error'}`, { type: 'error' });
        return;
      }
      const status = json?.status;
      const message = json?.message;

      if (status === 'SUCCESS') {
        alert.show('Saved account info');
        setIsEditing(false);
        onSaved?.();
      } else {
        alert.show(`Failed to save: ${message || status || 'Unknown error'}`, { type: 'error' });
      }
    } catch (e: any) {
      alert.show(`Failed to save: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  function beginEdit() {
    setIsEditing(true);
  }

  function cancelEdit() {
    if (isDirty) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm('Discard unsaved changes?');
      if (!ok) return;
    }
    setEmail(initial.email);
    setPhone(initial.phone);
    setAddress(initial.address);
    setCity(initial.city);
    setState(initial.state);
    setZipcode(initial.zipcode);
    setIsEditing(false);
  }

  function onBlurMaybeConfirm(e: React.FocusEvent<HTMLDivElement>) {
    if (!isEditing || !isDirty) return;
    const next = e.relatedTarget as HTMLElement | null;
    if (next && e.currentTarget.contains(next)) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('You have unsaved changes. Leave edit mode without saving?');
    if (ok) {
      cancelEdit();
    }
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body" onBlur={onBlurMaybeConfirm}>
        <div className="tw-flex tw-items-center tw-justify-between">
          <h5 className="card-title tw-mb-0">Account Information</h5>
          <div className="tw-flex tw-gap-2">
            {!isEditing && (
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={beginEdit}
              >
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveRootFields}
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        <hr />

        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Username</div>
          <div className="col-9 card-text tw-pt-2">{profile.username || ''}</div>
        </div>

        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Name</div>
          <div className="col-9 card-text tw-pt-2">
            {name}
          </div>
        </div>

        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Birth Date</div>
          <div className="col-9 card-text tw-pt-2">
            {profile.birthDate || ''}
          </div>
        </div>

        <div className="row tw-mb-2 tw-mt-1">
          <label htmlFor="email" className="col-3 card-text mt-2 text-primary-theme">Email</label>
          <div className="col-9 card-text">
            {isEditing ? (
              <input
                id="email"
                type="text"
                className="form-control form-purple"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <div className="tw-pt-2">{email}</div>
            )}
          </div>
        </div>

        <div className="row tw-mb-2 tw-mt-1">
          <label htmlFor="phone" className="col-3 card-text mt-2 text-primary-theme">Phone</label>
          <div className="col-9 card-text">
            {isEditing ? (
              <input
                id="phone"
                type="tel"
                className="form-control form-purple"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            ) : (
              <div className="tw-pt-2">{phone}</div>
            )}
          </div>
        </div>

        <div className="row tw-mb-2 tw-mt-1">
          <label htmlFor="address" className="col-3 card-text mt-2 text-primary-theme">Address</label>
          <div className="col-9 card-text">
            {isEditing ? (
              <>
                <input
                  id="address"
                  type="text"
                  className="form-control form-purple tw-mb-1"
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div className="tw-flex tw-gap-2">
                  <input
                    type="text"
                    className="form-control form-purple"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control form-purple"
                    placeholder="Zip"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="tw-pt-2">
                {[address, city, state, zipcode].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
