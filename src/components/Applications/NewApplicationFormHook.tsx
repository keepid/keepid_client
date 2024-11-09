import { useContext } from 'react';

import { NewApplicationFormContext } from './NewApplicationFormProvider';

export default function useNewApplicationFormContext() {
  return useContext(NewApplicationFormContext);
}
