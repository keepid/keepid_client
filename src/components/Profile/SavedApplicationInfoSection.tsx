import React, { useMemo, useState } from 'react';

import BasicInfoTab from './BasicInfoTab';

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
          <pre className="tw-text-xs tw-bg-gray-50 tw-p-3 tw-rounded">
            {JSON.stringify(familyInfo, null, 2)}
          </pre>
        );
      case 'demographic':
        return (
          <pre className="tw-text-xs tw-bg-gray-50 tw-p-3 tw-rounded">
            {JSON.stringify(demographicInfo, null, 2)}
          </pre>
        );
      case 'veteran':
        return (
          <pre className="tw-text-xs tw-bg-gray-50 tw-p-3 tw-rounded">
            {JSON.stringify(veteranStatus, null, 2)}
          </pre>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <h5 className="card-title tw-mb-3">Saved Application Information</h5>

        <div className="tw-flex tw-border-b tw-border-gray-200 tw-mb-3 tw-gap-x-4">
          {tabLabels.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tw-pb-2 tw-text-sm tw-font-medium tw-border-b-2 ${activeTab === tab.key
                ? 'tw-border-indigo-500 tw-text-indigo-600'
                : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
