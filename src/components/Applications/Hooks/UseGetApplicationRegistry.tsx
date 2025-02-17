import { useEffect, useState } from 'react';

import getServerURL from '../../../serverOverride';
import useFetch from '../../Api/UseFetch';
import { ApplicationFormData } from './ApplicationFormHook';

export default function useGetApplicationRegistry() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  // const { data, callFetch } = useFetch<{ blankFormId: string }>();
  // const { data: pdfData, callFetch: fetchPDF } = useFetch<{ fileId: string }>();

  const postData = async (
    formData: ApplicationFormData,
    isDirty: boolean,
    setIsDirty: (e: boolean) => void,
  ) => {
    if (isDirty) {
      const registryInfo = await fetch(`${getServerURL()}/get-application-registry`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(formData),
      }).then((res) => res.json());

      const pdfData = await fetch(`${getServerURL()}/download-file`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ fileType: 'FORM', fileId: registryInfo.blankFormId, targetUser: 'FACE-TO-FACE-ADMIN' }),
      }).then((res) => res.blob());

      const pdfFile = new File([pdfData], 'MyAwesomePDF', {
        type: 'application/pdf',
      });

      setPdfFile(pdfFile);
      setIsDirty(false);
    }
  };

  return {
    pdfFile,
    postData,
  };
}
