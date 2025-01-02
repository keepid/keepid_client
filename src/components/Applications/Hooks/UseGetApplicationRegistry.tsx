import { useEffect } from 'react';

import useFetch from '../../Api/UseFetch';
import { ApplicationFormData } from './ApplicationFormHook';

export default function useGetApplicationRegistry() {
  const { data, callFetch } = useFetch<string>();

  const postData = (
    formData: ApplicationFormData,
    isDirty: boolean,
    setIsDirty: (e: boolean) => void,
  ) => {
    if (isDirty) {
      console.log('Fetching pdf application registry');
      callFetch('get-application-registry', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setIsDirty(false);
    }
  };

  return {
    response: data,
    postData,
  };
}
