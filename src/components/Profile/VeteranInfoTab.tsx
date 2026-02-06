import React, { useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

type VeteranStatus = {
  isVeteran?: boolean;
  isProtectedVeteran?: boolean;
  branch?: string;
  yearsOfService?: string;
  rank?: string;
  discharge?: string;
};

type Props = {
  veteranStatus: VeteranStatus;
  usernameForUpdates?: string;
  onSaved?: () => void;
};

export default function VeteranInfoTab({
  veteranStatus,
  usernameForUpdates,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(
    () => ({
      isVeteran: !!veteranStatus.isVeteran,
      isProtectedVeteran: !!veteranStatus.isProtectedVeteran,
      branch: veteranStatus.branch || '',
      yearsOfService: veteranStatus.yearsOfService || '',
      rank: veteranStatus.rank || '',
      discharge: veteranStatus.discharge || '',
    }),
    [veteranStatus],
  );

  const [isVeteran, setIsVeteran] = useState(initial.isVeteran);
  const [isProtectedVeteran, setIsProtectedVeteran] = useState(initial.isProtectedVeteran);
  const [branch, setBranch] = useState(initial.branch);
  const [yearsOfService, setYearsOfService] = useState(initial.yearsOfService);
  const [rank, setRank] = useState(initial.rank);
  const [discharge, setDischarge] = useState(initial.discharge);

  const isDirty = useMemo(
    () =>
      isVeteran !== initial.isVeteran
      || isProtectedVeteran !== initial.isProtectedVeteran
      || branch !== initial.branch
      || yearsOfService !== initial.yearsOfService
      || rank !== initial.rank
      || discharge !== initial.discharge,
    [branch, discharge, initial, isProtectedVeteran, isVeteran, rank, yearsOfService],
  );

  function beginEdit() {
    setIsEditing(true);
  }

  function resetState() {
    setIsVeteran(initial.isVeteran);
    setIsProtectedVeteran(initial.isProtectedVeteran);
    setBranch(initial.branch);
    setYearsOfService(initial.yearsOfService);
    setRank(initial.rank);
    setDischarge(initial.discharge);
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
      const veteranPayload: any = {};

      if (isVeteran !== initial.isVeteran) {
        veteranPayload.isVeteran = isVeteran;
      }
      if (isProtectedVeteran !== initial.isProtectedVeteran) {
        veteranPayload.isProtectedVeteran = isProtectedVeteran;
      }
      if (branch !== initial.branch) {
        veteranPayload.branch = branch;
      }
      if (yearsOfService !== initial.yearsOfService) {
        veteranPayload.yearsOfService = yearsOfService;
      }
      if (rank !== initial.rank) {
        veteranPayload.rank = rank;
      }
      if (discharge !== initial.discharge) {
        veteranPayload.discharge = discharge;
      }

      if (Object.keys(veteranPayload).length === 0) {
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      const body: any = {
        optionalInformation: {
          veteranStatus: veteranPayload,
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
          `Failed to save veteran status: ${text || res.statusText || 'Unknown error'}`,
          { type: 'error' },
        );
        return;
      }

      if (json.status === 'SUCCESS') {
        alert.show('Saved veteran status information');
        setIsEditing(false);
        onSaved?.();
      } else {
        alert.show(
          `Failed to save veteran status: ${json.message || json.status || 'Unknown error'}`,
          { type: 'error' },
        );
      }
    } catch (e: any) {
      alert.show(`Failed to save veteran status: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
        <h6 className="tw-text-base tw-font-semibold tw-mb-0">Veteran Status</h6>
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
        <div className="col-3 card-text mt-2 text-primary-theme">Veteran</div>
        <div className="col-9 card-text tw-pt-2">
          {isEditing ? (
            <input
              type="checkbox"
              className="tw-form-checkbox"
              checked={!!isVeteran}
              onChange={(e) => setIsVeteran(e.target.checked)}
            />
          ) : (
            <span>{isVeteran ? 'Yes' : 'No'}</span>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Protected veteran</div>
        <div className="col-9 card-text tw-pt-2">
          {isEditing ? (
            <input
              type="checkbox"
              className="tw-form-checkbox"
              checked={!!isProtectedVeteran}
              onChange={(e) => setIsProtectedVeteran(e.target.checked)}
            />
          ) : (
            <span>{isProtectedVeteran ? 'Yes' : 'No'}</span>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Branch</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{branch}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Years of service</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{yearsOfService}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Rank</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{rank}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Discharge</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={discharge}
              onChange={(e) => setDischarge(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{discharge}</div>
          )}
        </div>
      </div>
    </div>
  );
}
