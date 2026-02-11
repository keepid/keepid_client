import React from 'react';
import { useLocation } from 'react-router-dom';

import ApplicationForm from './ApplicationForm';
import { ApplicationFormProvider } from './Hooks/ApplicationFormHook';

export default function CreateApplication() {
  const location = useLocation<{ clientUsername?: string }>();
  const clientUsername = location.state?.clientUsername || '';

  return (
    <ApplicationFormProvider clientUsername={clientUsername}>
      <ApplicationForm />
    </ApplicationFormProvider>
  );
}
