import React from 'react';

import NewApplicationFormProvider from './NewApplicationFormProvider';
import SelectApplicationForm from './SelectApplicationForm';

export default function SelectApplication() {
  return (
    <NewApplicationFormProvider>
      <SelectApplicationForm />
    </NewApplicationFormProvider>
  );
}
