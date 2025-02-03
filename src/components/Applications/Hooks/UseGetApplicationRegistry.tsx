import { useEffect, useState } from 'react';

import useFetch from '../../Api/UseFetch';
import { ApplicationFormData } from './ApplicationFormHook';

export default function useGetApplicationRegistry() {
  const { data, callFetch } = useFetch<{ blankFormId: string }>();
  const { data: pdfData, callFetch: fetchPDF } = useFetch();
  // const { pdf, setPDF } = useState();

  const postData = (
    formData: ApplicationFormData,
    isDirty: boolean,
    setIsDirty: (e: boolean) => void,
  ) => {
    if (isDirty) {
      console.log('Fetching pdf application registry');
      console.log(formData);
      callFetch('get-application-registry', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setIsDirty(false);
    }
  };

  useEffect(() => {
    if (data) {
      fetchPDF('get-form', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ fileType: 'FORM', fileId: data.blankFormId, isTemplate: 'true' }),
      });
    }
  }, [data, callFetch]);

  useEffect(() => {
    if (pdfData) console.log(pdfData);
  }, [pdfData]);

  return {
    response: data,
    postData,
  };
}
