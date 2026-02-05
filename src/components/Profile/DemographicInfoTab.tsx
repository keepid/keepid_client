import React, { useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import { toCitizenshipEnumConstant, toRaceEnumConstant } from '../../lib/demographicEnums';
import getServerURL from '../../serverOverride';

type DemographicInfo = {
  languagePreference?: string;
  isEthnicityHispanicLatino?: boolean | null;
  race?: string;
  cityOfBirth?: string;
  stateOfBirth?: string;
  countryOfBirth?: string;
  citizenship?: string;
};

type Props = {
  demographicInfo: DemographicInfo;
  usernameForUpdates?: string;
  onSaved?: () => void;
};

export default function DemographicInfoTab({
  demographicInfo,
  usernameForUpdates,
  onSaved,
}: Props) {
  const alert = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(
    () => ({
      languagePreference: demographicInfo.languagePreference || '',
      isEthnicityHispanicLatino:
        demographicInfo.isEthnicityHispanicLatino === null
        || demographicInfo.isEthnicityHispanicLatino === undefined
          ? false
          : demographicInfo.isEthnicityHispanicLatino,
      race: demographicInfo.race || '',
      cityOfBirth: demographicInfo.cityOfBirth || '',
      stateOfBirth: demographicInfo.stateOfBirth || '',
      countryOfBirth: demographicInfo.countryOfBirth || '',
      citizenship: demographicInfo.citizenship || '',
    }),
    [demographicInfo],
  );

  const [languagePreference, setLanguagePreference] = useState(initial.languagePreference);
  const [isEthnicityHispanicLatino, setIsEthnicityHispanicLatino] = useState(
    initial.isEthnicityHispanicLatino,
  );
  const [race, setRace] = useState(initial.race);
  const [cityOfBirth, setCityOfBirth] = useState(initial.cityOfBirth);
  const [stateOfBirth, setStateOfBirth] = useState(initial.stateOfBirth);
  const [countryOfBirth, setCountryOfBirth] = useState(initial.countryOfBirth);
  const [citizenship, setCitizenship] = useState(initial.citizenship);

  const isDirty = useMemo(
    () =>
      languagePreference !== initial.languagePreference
      || isEthnicityHispanicLatino !== initial.isEthnicityHispanicLatino
      || race !== initial.race
      || cityOfBirth !== initial.cityOfBirth
      || stateOfBirth !== initial.stateOfBirth
      || countryOfBirth !== initial.countryOfBirth
      || citizenship !== initial.citizenship,
    [
      citizenship,
      cityOfBirth,
      countryOfBirth,
      initial,
      isEthnicityHispanicLatino,
      languagePreference,
      race,
      stateOfBirth,
    ],
  );

  function beginEdit() {
    setIsEditing(true);
  }

  function resetState() {
    setLanguagePreference(initial.languagePreference);
    setIsEthnicityHispanicLatino(initial.isEthnicityHispanicLatino);
    setRace(initial.race);
    setCityOfBirth(initial.cityOfBirth);
    setStateOfBirth(initial.stateOfBirth);
    setCountryOfBirth(initial.countryOfBirth);
    setCitizenship(initial.citizenship);
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
      const demographicPayload: any = {};

      if (languagePreference !== initial.languagePreference) {
        demographicPayload.languagePreference = languagePreference;
      }
      if (isEthnicityHispanicLatino !== initial.isEthnicityHispanicLatino) {
        demographicPayload.isEthnicityHispanicLatino = isEthnicityHispanicLatino;
      }
      if (race !== initial.race) {
        demographicPayload.race = toRaceEnumConstant(race);
      }
      if (cityOfBirth !== initial.cityOfBirth) {
        demographicPayload.cityOfBirth = cityOfBirth;
      }
      if (stateOfBirth !== initial.stateOfBirth) {
        demographicPayload.stateOfBirth = stateOfBirth;
      }
      if (countryOfBirth !== initial.countryOfBirth) {
        demographicPayload.countryOfBirth = countryOfBirth;
      }
      if (citizenship !== initial.citizenship) {
        demographicPayload.citizenship = toCitizenshipEnumConstant(citizenship);
      }

      if (Object.keys(demographicPayload).length === 0) {
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      const body: any = {
        optionalInformation: {
          demographicInfo: demographicPayload,
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
          `Failed to save demographic info: ${text || res.statusText || 'Unknown error'}`,
          { type: 'error' },
        );
        return;
      }

      if (json.status === 'SUCCESS') {
        alert.show('Saved demographic information');
        setIsEditing(false);
        onSaved?.();
      } else {
        alert.show(
          `Failed to save demographic info: ${json.message || json.status || 'Unknown error'}`,
          { type: 'error' },
        );
      }
    } catch (e: any) {
      alert.show(`Failed to save demographic info: ${e?.message || String(e)}`, { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
        <h6 className="tw-text-base tw-font-semibold tw-mb-0">Demographic Information</h6>
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
        <div className="col-3 card-text mt-2 text-primary-theme">Language preference</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={languagePreference}
              onChange={(e) => setLanguagePreference(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{languagePreference}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Hispanic / Latino</div>
        <div className="col-9 card-text tw-pt-2">
          {isEditing ? (
            <input
              type="checkbox"
              className="tw-form-checkbox"
              checked={!!isEthnicityHispanicLatino}
              onChange={(e) => setIsEthnicityHispanicLatino(e.target.checked)}
            />
          ) : (
            <span>{isEthnicityHispanicLatino ? 'Yes' : 'No'}</span>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Race (enum)</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={race}
              onChange={(e) => setRace(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{race}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">City of birth</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={cityOfBirth}
              onChange={(e) => setCityOfBirth(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{cityOfBirth}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">State of birth</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={stateOfBirth}
              onChange={(e) => setStateOfBirth(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{stateOfBirth}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Country of birth</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={countryOfBirth}
              onChange={(e) => setCountryOfBirth(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{countryOfBirth}</div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-3 card-text mt-2 text-primary-theme">Citizenship (enum)</div>
        <div className="col-9 card-text">
          {isEditing ? (
            <input
              type="text"
              className="form-control form-purple"
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value)}
            />
          ) : (
            <div className="tw-pt-2">{citizenship}</div>
          )}
        </div>
      </div>
    </div>
  );
}
