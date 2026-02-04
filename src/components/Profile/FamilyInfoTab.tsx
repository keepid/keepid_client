import React, { useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

type FamilyInfo = {
  maritalStatus?: string;
};

type Props = {
  familyInfo: FamilyInfo;
  usernameForUpdates?: string;
  onSaved?: () => void;
};

export default function FamilyInfoTab({
  familyInfo,
  usernameForUpdates,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(
    () => ({
      maritalStatus: familyInfo.maritalStatus || '',
    }),
    [familyInfo.maritalStatus],
  );

  const [maritalStatus, setMaritalStatus] = useState(initial.maritalStatus);

  const isDirty = useMemo(
    () => maritalStatus !== initial.maritalStatus,
    [maritalStatus, initial.maritalStatus],
  );

  function beginEdit() {
    setIsEditing(true);
  }

  function resetState() {
    setMaritalStatus(initial.maritalStatus);
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
      const familyPayload: any = {};

      if (maritalStatus !== initial.maritalStatus) {
        familyPayload.maritalStatus = maritalStatus;
      }

      if (Object.keys(familyPayload).length === 0) {
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      const body: any = {
        optionalInformation: {
          familyInfo: familyPayload,
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
        alert.show(
          `Failed to save family info: ${text || res.statusText || 'Unknown error'}`,
          { type: 'error' },
        );
        return;
      }

      if (json.status === 'SUCCESS') {
        alert.show('Saved family information');
        setIsEditing(false);
        onSaved?.();
      } else {
        alert.show(
          `Failed to save family info: ${json.message || json.status || 'Unknown error'}`,
          { type: 'error' },
        );
      }
    } catch (e: any) {
      alert.show(`Failed to save family info: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
        <h6 className="tw-text-base tw-font-semibold tw-mb-0">Family Information</h6>
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

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Marital status (enum)</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{maritalStatus}</div>
          )}
        </div>
      </div>

      {/* Array fields (parents/children/etc.) remain read-only for now */}
    </div>
  );
}
