import React, { useMemo, useState } from 'react';

import BasicInfoTab from './BasicInfoTab';
import DemographicInfoTab from './DemographicInfoTab';
import FamilyInfoTab from './FamilyInfoTab';
import VeteranInfoTab from './VeteranInfoTab';

type Props = {
  privilegeLevel?: string;
  optionalInformation?: any;
  usernameForUpdates?: string;
  onSaved?: () => void;
};

type TabKey = 'basic' | 'family' | 'demographic' | 'veteran';

const tabLabels: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Basic Information' },
  { key: 'family', label: 'Family Information' },
  { key: 'demographic', label: 'Demographic Information' },
  { key: 'veteran', label: 'Veteran Status' },
];

export default function SavedApplicationInfoSection({
  privilegeLevel,
  optionalInformation,
  usernameForUpdates,
  onSaved,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const isClientProfile = useMemo(
    () => privilegeLevel === 'Client',
    [privilegeLevel],
  );

  if (!isClientProfile) {
    // Case worker/admin self-profile: no optionalInformation shown by design
    return null;
  }

  const basicInfo = (optionalInformation && optionalInformation.basicInfo) || {};
  const familyInfo = (optionalInformation && optionalInformation.familyInfo) || {};
  const demographicInfo =
    (optionalInformation && optionalInformation.demographicInfo) || {};
  const veteranStatus = (optionalInformation && optionalInformation.veteranStatus) || {};

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            basicInfo={basicInfo}
            usernameForUpdates={usernameForUpdates}
            onSaved={onSaved}
          />
        );
      case 'family':
        return (
          <FamilyInfoTab
            familyInfo={familyInfo}
            usernameForUpdates={usernameForUpdates}
            onSaved={onSaved}
          />
        );
      case 'demographic':
        return (
          <DemographicInfoTab
            demographicInfo={demographicInfo}
            usernameForUpdates={usernameForUpdates}
            onSaved={onSaved}
          />
        );
      case 'veteran':
        return (
          <VeteranInfoTab
            veteranStatus={veteranStatus}
            usernameForUpdates={usernameForUpdates}
            onSaved={onSaved}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <h5 className="card-title tw-mb-0">Saved Application Information</h5>

        <hr />

        <div className="tw-flex tw-border-b tw-border-gray-200 tw-mb-3 tw-gap-x-4 tw-items-baseline">
          {tabLabels.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tw-px-1 tw-py-0.5 tw-text-sm tw-font-medium tw-border-b-2 tw-transition-colors tw-cursor-pointer tw-bg-transparent tw-border-solid tw-inline-flex tw-items-center ${
                activeTab === tab.key
                  ? 'tw-border-indigo-500 tw-text-indigo-600'
                  : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tw-mt-3">{renderTabContent()}</div>
      </div>
    </div>
  );
}
