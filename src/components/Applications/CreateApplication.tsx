import React from 'react';
import { useLocation } from 'react-router-dom';

import Role from '../../static/Role';
import ApplicationForm from './ApplicationForm';
import type { SelectorCompletionContext } from './applicationSelector/types';
import { ApplicationFormProvider, formContent } from './Hooks/ApplicationFormHook';

export default function CreateApplication({ userRole }: { userRole: Role }) {
  const location = useLocation<{
    clientUsername?: string;
    clientName?: string;
    presetApplication?: {
      applicationId: string;
      label: string;
      state?: string;
      idType?: string;
      housingStatus?: string;
    };
    startAtWebForm?: boolean;
    selectorCompletion?: SelectorCompletionContext;
    serviceRecordId?: string;
  }>();
  const clientUsername = location.state?.clientUsername || '';
  const clientName = location.state?.clientName || '';
  const preset = location.state?.presetApplication;
  const startAtWebForm = Boolean(location.state?.startAtWebForm && preset?.applicationId);
  const hasPresetClient = clientUsername.trim().length > 0;
  const shouldShowWhoForStep = userRole === Role.Worker
    || userRole === Role.Admin
    || userRole === Role.Director;
  const whoForPageIndex = formContent.findIndex((p) => p.pageName === 'whoFor');
  const typePageIndex = formContent.findIndex((p) => p.pageName === 'type');
  const reviewPageIndex = formContent.findIndex((p) => p.pageName === 'review');
  const webFormPageIndex = formContent.findIndex((p) => p.pageName === 'webForm');
  const postWhoForPage = reviewPageIndex >= 0
    ? reviewPageIndex
    : typePageIndex;
  let initialPage = postWhoForPage;
  if (startAtWebForm && hasPresetClient && webFormPageIndex >= 0) {
    initialPage = webFormPageIndex;
  } else {
    initialPage = shouldShowWhoForStep && whoForPageIndex >= 0
      ? whoForPageIndex
      : postWhoForPage;
  }

  return (
    <ApplicationFormProvider
      userRole={userRole}
      clientUsername={clientUsername}
      clientName={clientName}
      initialPage={initialPage}
      whoForNextPage={postWhoForPage}
      initialDirty={startAtWebForm}
      initialDataOverride={
        preset
          ? {
            applicationId: preset.applicationId,
            label: preset.label,
            state: preset.state ?? '',
            idType: preset.idType ?? '',
            housingStatus: preset.housingStatus ?? '',
            person: 'MYSELF',
          }
          : undefined
      }
    >
      <ApplicationForm
        selectorCompletion={location.state?.selectorCompletion}
        serviceRecordId={location.state?.serviceRecordId}
      />
    </ApplicationFormProvider>
  );
}
