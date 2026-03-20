import React from 'react';
import { useLocation } from 'react-router-dom';

import Role from '../../static/Role';
import ApplicationForm from './ApplicationForm';
import { ApplicationFormProvider, formContent } from './Hooks/ApplicationFormHook';

export default function CreateApplication({ userRole }: { userRole: Role }) {
  const location = useLocation<{
    clientUsername?: string;
    clientName?: string;
    presetApplication?: {
      lookupKey: string;
      type: string;
      state: string;
      situation: string;
    };
    startAtReview?: boolean;
  }>();
  const clientUsername = location.state?.clientUsername || '';
  const clientName = location.state?.clientName || '';
  const preset = location.state?.presetApplication;
  const startAtReview = Boolean(location.state?.startAtReview && preset);
  const shouldShowWhoForStep = userRole === Role.Worker
    || userRole === Role.Admin
    || userRole === Role.Director;
  const whoForPageIndex = formContent.findIndex((p) => p.pageName === 'whoFor');
  const typePageIndex = formContent.findIndex((p) => p.pageName === 'type');
  const reviewPageIndex = formContent.findIndex((p) => p.pageName === 'review');
  const postWhoForPage = startAtReview && reviewPageIndex >= 0
    ? reviewPageIndex
    : typePageIndex;
  const initialPage = shouldShowWhoForStep && whoForPageIndex >= 0
    ? whoForPageIndex
    : postWhoForPage;

  return (
    <ApplicationFormProvider
      userRole={userRole}
      clientUsername={clientUsername}
      clientName={clientName}
      initialPage={initialPage}
      whoForNextPage={postWhoForPage}
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
