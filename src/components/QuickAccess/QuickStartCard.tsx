import React, { useEffect, useState } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';

import getServerURL from '../../serverOverride';
import ApplyIDIcon from '../../static/images/QuickAccess/ApplyID.svg';
import UploadIDIcon from '../../static/images/QuickAccess/UploadID.svg';

enum UserSituation {
  None = 'none',
  ApplyID = 'apply-id',
  UploadID = 'upload-id'
}

interface ChecklistTask {
  id: string;
  complete: boolean;
  title: string;
  link: string;
  linkText: string;
}

const QuickStartCard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [minimized, setMinimized] = useState<boolean>(false);
  const [userSituation, setUserSituation] = useState<UserSituation>(UserSituation.None);
  const [checklistData, setChecklistData] = useState<ChecklistTask[]>([]);
  const [checkedSituation, setCheckedSituation] = useState<UserSituation>(UserSituation.None);

  const fetchQuickStartChecklist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${getServerURL()}/onboarding-checklist`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setIsLoading(false);
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data = await response.json();

      setIsLoading(false);
      setMinimized(data.minimized);
      setUserSituation(data.situation || UserSituation.None);
      setChecklistData(data.tasks || []);
    } catch (error) {
      console.error('Error fetching quick start status:', error);
      // Default to prompt if fetch fails
      setMinimized(false);
      setUserSituation(UserSituation.None);
      setChecklistData([]);
    }
  };

  useEffect(() => {
    fetchQuickStartChecklist();
  }, []);

  const updateUserSituation = async (newUserSituation) => {
    try {
      const response = await fetch(`${getServerURL()}/onboarding-checklist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situation: newUserSituation,
          minimized: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit situation: ${response.status}`);
      }

      setUserSituation(newUserSituation as UserSituation);

      await fetchQuickStartChecklist();
    } catch (error) {
      console.error('Error submitting situation:', error);
    }
  };

  const handleSituationSubmit = async (e) => {
    e.preventDefault();
    const selectedRadio : HTMLInputElement | null = document.querySelector('input[name="situation"]:checked');
    const radioVal = selectedRadio?.value;
    if (!radioVal) return;
    updateUserSituation(radioVal);
  };

  const handleBack = async (e) => {
    e.preventDefault();
    setCheckedSituation(UserSituation.None);
    updateUserSituation('none');
  };

  const handleMinimize = async () => {
    try {
      const newMinimized = !minimized;
      setMinimized(newMinimized);

      const response = await fetch(`${getServerURL()}/onboarding-checklist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situation: userSituation,
          minimized: newMinimized,
        }),
      });

      if (!response.ok) {
        setMinimized(!newMinimized);
        throw new Error(`Failed to update onboarding status: ${response.status}`);
      }

      if (!newMinimized) {
        // If expanding, fetch the latest checklist data
        await fetchQuickStartChecklist();
      }
    } catch (error) {
      setMinimized(!minimized);
      console.error('Error updating quick start card:', error);
    }
  };

  if (isLoading) return null;
  if (minimized) {
    return (
      <div className="tw-rounded-md tw-bg-blue-50 tw-p-3 tw-transition-all tw-duration-300 tw-ease-in-out" style={{ boxShadow: '0rem 0rem 1rem rgba(33, 37, 41, 0.15)', animation: 'fadeIn 0.3s ease-in forwards' }}>
        <button
          type="button"
          onClick={handleMinimize}
          className="tw-flex tw-items-center tw-justify-between tw-w-full tw-text-left hover:tw-bg-blue-100 tw-p-2 tw-rounded tw-transition-colors tw-duration-200 tw-bg-transparent"
          aria-label="Expand quick start guide"
        >
          <div className="tw-flex tw-items-center tw-space-x-2">
            <span className="tw-text-base tw-font-medium tw-text-black-800">Quick Start Guide</span>
          </div>
          <svg className="tw-w-4 tw-h-4 tw-text-black-400 tw-transition-transform tw-duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L10 14.414l-4.707-4.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  } if (userSituation === UserSituation.None) {
    const situationOptions = [
      {
        id: UserSituation.ApplyID,
        label: 'I want to apply for an ID',
        iconAlt: `${UserSituation.ApplyID}-icon`,
        iconSrc: ApplyIDIcon,
      },
      {
        id: UserSituation.UploadID,
        label: 'I have an ID to upload',
        iconAlt: `${UserSituation.UploadID}-icon`,
        iconSrc: UploadIDIcon,
      },
    ];

    return (
      <div className="tw-rounded-md tw-bg-blue-50 tw-p-4 tw-transition-all tw-duration-300 tw-ease-in-out tw-transform tw-scale-100 tw-opacity-100" style={{ boxShadow: '0rem 0rem 1rem rgba(33, 37, 41, 0.15)', animation: 'fadeIn 0.3s ease-in forwards' }}>
        <div className="tw-flex">
          <div className="tw-ml-3 tw-flex-1">
            <div className="tw-flex tw-items-start tw-justify-between tw-mb-2">
              <h3 className="tw-text-md tw-font-medium tw-text-black-800 tw-my-auto">
                Quick Start Guide
              </h3>
              <button
                type="button"
                onClick={handleMinimize}
                className="tw-flex tw-items-center tw-space-x-1 tw-text-black-400 hover:tw-bg-blue-100 tw-bg-transparent tw-px-3 tw-py-1 tw-rounded tw-transition-colors tw-duration-200 tw-text-base"
                aria-label="Minimize quick start guide"
              >
                <span>Minimize</span>
                <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="tw-text-base tw-text-black-700 tw-mb-4">
              Select your situation to get a personalized checklist.
            </p>
            <div>
              <div className="tw-flex tw-flex-row tw-gap-3 tw-mb-4">
                {situationOptions.map((option) => {
                  const checked = option.id === checkedSituation;
                  return (
<ToggleButton
  type="radio"
  checked={checked}
  key={option.id}
  value={option.id}
  id={option.id}
  name="situation"
  onChange={(e) => { setCheckedSituation(e.target.value as UserSituation); }}
  className={`toggle-button tw-border-2 tw-min-h-[260px] tw-flex-1 tw-flex tw-flex-col tw-place-content-center tw-rounded-lg tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.15)] 
                      ${checked ? '!tw-bg-indigo-100 !tw-border-gray-500 !tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.4)]' : ''}`}
>
                    <img alt={option.iconAlt} src={option.iconSrc} className="tw-my-4 tw-h-24 tw-w-auto tw-aspect-auto tw-pointer-events-none" />
                    <p className={
                      `tw-text-lg tw-font-bold tw-mb-2 !active:tw-text-black tw-pointer-events-none tw-text-black
                      ${checked ? '' : ''}`}
                    >{option.label}
                    </p>
</ToggleButton>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleSituationSubmit}
                disabled={!userSituation}
                className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-text-base tw-font-medium tw-text-black tw-bg-white tw-border tw-border-black tw-rounded-md hover:tw-bg-[#4b4f9a] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-transition-all tw-duration-200 hover:tw-text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const completedCount = checklistData.filter((item) => item.complete).length || 0;
  const totalCount = checklistData.length || 0;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
      <div className="tw-rounded-md tw-bg-blue-50 tw-p-4 tw-transition-all tw-duration-300 tw-ease-in-out tw-transform tw-scale-100 tw-opacity-100" style={{ boxShadow: '0rem 0rem 1rem rgba(33, 37, 41, 0.15)', animation: 'fadeIn 0.3s ease-in forwards' }}>
        <div className="tw-flex">
          <div className="tw-ml-3 tw-flex-1">
            <div className="tw-flex tw-items-start tw-justify-between tw-mb-3">
              <h3 className="tw-text-md tw-font-medium tw-text-black-800 tw-my-auto">
                Quick Start Checklist
              </h3>
              <div className="tw-flex tw-items-center tw-space-x-2">
                <span className="tw-text-base tw-text-black-600 tw-font-medium tw-mr-2">
                  {completedCount}/{totalCount} completed ({progressPercentage}%)
                </span>
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="tw-flex tw-items-center tw-space-x-1 tw-text-black-400 hover:tw-bg-blue-100 tw-bg-transparent tw-px-3 tw-py-1 tw-rounded tw-transition-colors tw-duration-200 tw-text-base"
                  aria-label="Minimize quick start guide"
                >
                  <span>Minimize</span>
                  <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="tw-mb-4">
              <div className="tw-bg-blue-200 tw-rounded-full tw-h-2">
                <div
                  className="tw-bg-blue-600 tw-h-2 tw-rounded-full tw-transition-all tw-duration-500 tw-ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <ul className="tw-space-y-3 tw-list-none pl-0">
              {checklistData.map((item) => (
                <li key={item.id} className="tw-transition-all tw-duration-200">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center tw-flex-1">
                      <div className="tw-flex-shrink-0 tw-mr-3">
                        <div className={`tw-w-4 tw-h-4 tw-rounded tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-200 ${
                          item.complete
                            ? 'tw-bg-blue-600 tw-border-blue-600'
                            : 'tw-border-blue-300 tw-bg-white'
                        }`}
                        >
                          {item.complete && (
                            <svg className="tw-w-3 tw-h-3 tw-text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className={`tw-text-base tw-transition-all tw-duration-200 tw-flex-1 ${
                        item.complete
                          ? 'tw-text-black-600 tw-line-through'
                          : 'tw-text-black-700'
                      }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    {item.link && item.linkText && (
                      <a
                        href={item.link}
                        className="tw-ml-3 tw-flex-shrink-0 tw-text-sm tw-text-black tw-bg-white tw-border-black hover:tw-bg-[#4b4f9a] tw-px-3 tw-py-2 tw-rounded tw-transition-colors tw-duration-200 tw-shadow-sm hover:tw-shadow-md tw-cursor-pointer hover:tw-text-white"
                        title="Click to complete this task"
                      >
                        Access {item.linkText} →
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {progressPercentage === 100 && (
              <div className="tw-mt-4 tw-mb-4 tw-p-3 tw-bg-green-100 tw-border tw-border-green-200 tw-rounded-md tw-transition-all tw-duration-300 tw-ease-in-out">
                <p className="tw-text-base tw-text-green-700 tw-font-medium">
                  🎉 Congratulations! You have completed all quick start tasks.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleBack}
              className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-text-base tw-font-medium tw-text-black tw-bg-white tw-border tw-border-black tw-rounded-md hover:tw-bg-[#4b4f9a] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-transition-all tw-duration-200 hover:tw-text-white tw-mt-5"
            >
              Back
            </button>
          </div>
        </div>
      </div>
  );
};

export default QuickStartCard;
