import React from 'react';

import ApplicationForm from './ApplicationForm';
import { ApplicationFormProvider } from './Hooks/ApplicationFormHook';

export default function CreateApplication() {
  return (
    <ApplicationFormProvider>
      <ApplicationForm />
    </ApplicationFormProvider>
  );
}
