import React from 'react';
import { useLocation } from 'react-router-dom';

import ApplicationForm from './ApplicationForm';
import { ApplicationFormProvider, formContent } from './Hooks/ApplicationFormHook';

export default function CreateApplication() {
  const location = useLocation<{
    clientUsername?: string;
    presetApplication?: {
      lookupKey: string;
      type: string;
      state: string;
      situation: string;
    };
    startAtReview?: boolean;
  }>();
  const clientUsername = location.state?.clientUsername || '';
  const preset = location.state?.presetApplication;
  const startAtReview = Boolean(location.state?.startAtReview && preset);
  const reviewPageIndex = formContent.findIndex((p) => p.pageName === 'review');

  return (
    <ApplicationFormProvider
      clientUsername={clientUsername}
      initialPage={startAtReview && reviewPageIndex >= 0 ? reviewPageIndex : 0}
      initialDirty={startAtReview}
      initialDataOverride={
        preset
          ? {
            type: preset.type,
            state: preset.state,
            situation: preset.situation,
            person: 'MYSELF',
          }
          : undefined
      }
    >
      <ApplicationForm />
    </ApplicationFormProvider>
  );
}
