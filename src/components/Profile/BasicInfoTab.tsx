import React, { useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

type Address = {
  streetAddress?: string;
  apartmentNumber?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type BasicInfo = {
  genderAssignedAtBirth?: string;
  emailAddress?: string;
  phoneNumber?: string;
  mailingAddress?: Address;
  residentialAddress?: Address;
  haveDisability?: boolean | null;
};

type Props = {
  basicInfo: BasicInfo;
  usernameForUpdates?: string;
  onSaved?: () => void;
};

export default function BasicInfoTab({
  basicInfo,
  usernameForUpdates,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(
    () => ({
      gender: basicInfo.genderAssignedAtBirth || '',
      email: basicInfo.emailAddress || '',
      phone: basicInfo.phoneNumber || '',
      mailing: {
        streetAddress: basicInfo.mailingAddress?.streetAddress || '',
        apartmentNumber: basicInfo.mailingAddress?.apartmentNumber || '',
        city: basicInfo.mailingAddress?.city || '',
        state: basicInfo.mailingAddress?.state || '',
        zip: basicInfo.mailingAddress?.zip || '',
      },
      residential: {
        streetAddress: basicInfo.residentialAddress?.streetAddress || '',
        apartmentNumber: basicInfo.residentialAddress?.apartmentNumber || '',
        city: basicInfo.residentialAddress?.city || '',
        state: basicInfo.residentialAddress?.state || '',
        zip: basicInfo.residentialAddress?.zip || '',
      },
      haveDisability:
        basicInfo.haveDisability === null || basicInfo.haveDisability === undefined
          ? false
          : basicInfo.haveDisability,
    }),
    [basicInfo],
  );

  const [gender, setGender] = useState(initial.gender);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [mailing, setMailing] = useState(initial.mailing);
  const [residential, setResidential] = useState(initial.residential);
  const [haveDisability, setHaveDisability] = useState(initial.haveDisability);

  const isDirty = useMemo(
    () =>
      gender !== initial.gender
      || email !== initial.email
      || phone !== initial.phone
      || haveDisability !== initial.haveDisability
      || mailing.streetAddress !== initial.mailing.streetAddress
      || mailing.apartmentNumber !== initial.mailing.apartmentNumber
      || mailing.city !== initial.mailing.city
      || mailing.state !== initial.mailing.state
      || mailing.zip !== initial.mailing.zip
      || residential.streetAddress !== initial.residential.streetAddress
      || residential.apartmentNumber !== initial.residential.apartmentNumber
      || residential.city !== initial.residential.city
      || residential.state !== initial.residential.state
      || residential.zip !== initial.residential.zip,
    [email, gender, haveDisability, initial, mailing, phone, residential],
  );

  function beginEdit() {
    setIsEditing(true);
  }

  function resetState() {
    setGender(initial.gender);
    setEmail(initial.email);
    setPhone(initial.phone);
    setMailing(initial.mailing);
    setResidential(initial.residential);
    setHaveDisability(initial.haveDisability);
  }

  function cancelEdit() {
    if (isDirty) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm('Discard unsaved changes?');
      if (!ok) return;
    }
    resetState();
    setIsEditing(false);
  }

  async function save() {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const basicPayload: any = {};

      if (gender !== initial.gender) {
        basicPayload.genderAssignedAtBirth = gender;
      }
      if (email !== initial.email) {
        basicPayload.emailAddress = email;
      }
      if (phone !== initial.phone) {
        basicPayload.phoneNumber = phone;
      }
      if (haveDisability !== initial.haveDisability) {
        basicPayload.haveDisability = haveDisability;
      }

      const mailingChanged =
        mailing.streetAddress !== initial.mailing.streetAddress
        || mailing.apartmentNumber !== initial.mailing.apartmentNumber
        || mailing.city !== initial.mailing.city
        || mailing.state !== initial.mailing.state
        || mailing.zip !== initial.mailing.zip;

      if (mailingChanged) {
        basicPayload.mailingAddress = {
          streetAddress: mailing.streetAddress || null,
          apartmentNumber: mailing.apartmentNumber || null,
          city: mailing.city || null,
          state: mailing.state || null,
          zip: mailing.zip || null,
        };
      }

      const residentialChanged =
        residential.streetAddress !== initial.residential.streetAddress
        || residential.apartmentNumber !== initial.residential.apartmentNumber
        || residential.city !== initial.residential.city
        || residential.state !== initial.residential.state
        || residential.zip !== initial.residential.zip;

      if (residentialChanged) {
        basicPayload.residentialAddress = {
          streetAddress: residential.streetAddress || null,
          apartmentNumber: residential.apartmentNumber || null,
          city: residential.city || null,
          state: residential.state || null,
          zip: residential.zip || null,
        };
      }

      if (Object.keys(basicPayload).length === 0) {
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      const body: any = {
        optionalInformation: {
          basicInfo: basicPayload,
        },
      };

      if (usernameForUpdates) {
        body.username = usernameForUpdates;
      }

      const res = await fetch(`${getServerURL()}/update-user-profile`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        alert.show(`Failed to save basic info: ${text || res.statusText || 'Unknown error'}`, {
          type: 'error',
        });
        return;
      }

      if (json.status === 'SUCCESS') {
        alert.show('Saved basic application information');
        setIsEditing(false);
        onSaved?.();
      } else {
        alert.show(
          `Failed to save basic info: ${json.message || json.status || 'Unknown error'}`,
          { type: 'error' },
        );
      }
    } catch (e: any) {
      alert.show(`Failed to save basic info: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
        <h6 className="tw-text-base tw-font-semibold tw-mb-0">Basic Information</h6>
        <div className="tw-flex tw-gap-2">
          {!isEditing && (
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={beginEdit}
            >
              Edit
            </button>
          )}
          {isEditing && (
            <>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={cancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={save}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tight list of fields, similar to EssentialAccountSection styling */}
      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Gender at birth</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{gender}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Email</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
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

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Phone</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{phone}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Mailing address</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <>
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Street address"
                value={mailing.streetAddress}
                onChange={(e) =>
                  setMailing({ ...mailing, streetAddress: e.target.value })}
              />
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Apartment, suite, etc."
                value={mailing.apartmentNumber}
                onChange={(e) =>
                  setMailing({ ...mailing, apartmentNumber: e.target.value })}
              />
              <div className="tw-flex tw-gap-2">
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="City"
                  value={mailing.city}
                  onChange={(e) =>
                    setMailing({ ...mailing, city: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="State"
                  value={mailing.state}
                  onChange={(e) =>
                    setMailing({ ...mailing, state: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="Zip"
                  value={mailing.zip}
                  onChange={(e) =>
                    setMailing({ ...mailing, zip: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="tw-pt-2">
              {[mailing.streetAddress, mailing.apartmentNumber, mailing.city, mailing.state, mailing.zip]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Residential address</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <>
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Street address"
                value={residential.streetAddress}
                onChange={(e) =>
                  setResidential({ ...residential, streetAddress: e.target.value })}
              />
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Apartment, suite, etc."
                value={residential.apartmentNumber}
                onChange={(e) =>
                  setResidential({ ...residential, apartmentNumber: e.target.value })}
              />
              <div className="tw-flex tw-gap-2">
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="City"
                  value={residential.city}
                  onChange={(e) =>
                    setResidential({ ...residential, city: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="State"
                  value={residential.state}
                  onChange={(e) =>
                    setResidential({ ...residential, state: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="Zip"
                  value={residential.zip}
                  onChange={(e) =>
                    setResidential({ ...residential, zip: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="tw-pt-2">
              {[residential.streetAddress, residential.apartmentNumber, residential.city,
                residential.state, residential.zip]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Have disability</div>
        <div className="col-9 card-text tw-pt-2">
          {isEditing ? (
            <input
              type="checkbox"
              className="tw-form-checkbox"
              checked={haveDisability}
              onChange={(e) => setHaveDisability(e.target.checked)}
            />
          ) : (
            <span>{haveDisability ? 'Yes' : 'No'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
