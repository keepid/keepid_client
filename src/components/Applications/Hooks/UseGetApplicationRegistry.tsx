import { useState } from 'react';

import getServerURL from '../../../serverOverride';
import { ApplicationFormData } from './ApplicationFormHook';

export default function useGetApplicationRegistry() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [blankFormId, setBlankFormId] = useState<string | null>(null);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState<string | null>(null);

  /**
   * Fetches the application registry to get the blankFormId for the selected
   * application type/state/situation/person. Call this when entering the
   * webForm step so the form component has an applicationId to use.
   */
  const fetchRegistry = async (
    formData: ApplicationFormData,
    isDirty: boolean,
    setIsDirty: (e: boolean) => void,
  ): Promise<string | null> => {
    if (!isDirty) return blankFormId;
    setRegistryLoading(true);
    setRegistryError(null);

    const registryInfo = await fetch(`${getServerURL()}/get-application-registry`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .catch((error) => {
        console.error(error);
        setRegistryError('Could not load the selected application. Please try again.');
        return null;
      });

    if (!registryInfo || !registryInfo.blankFormId) {
      setBlankFormId(null);
      setPdfFile(null);
      const serverMessage = typeof registryInfo?.message === 'string' ? registryInfo.message : '';
      setRegistryError(
        serverMessage || 'This application is not available for your organization.',
      );
      setRegistryLoading(false);
      return null;
    }

    setBlankFormId(registryInfo.blankFormId);
    setRegistryError(null);
    setIsDirty(false);
    setRegistryLoading(false);
    return registryInfo.blankFormId;
  };

  /**
   * Calls /fill-pdf-2 with form answers and stores the resulting filled PDF
   * for the preview step.
   */
  const fillPdf = async (
    applicationId: string,
    formAnswers: Record<string, any>,
    clientUsername: string = '',
  ): Promise<File | null> => {
    const formData = new FormData();
    formData.append('clientUsername', clientUsername);
    formData.append('applicationId', applicationId);
    formData.append('formAnswers', JSON.stringify(formAnswers));

    const responseBlob = await fetch(`${getServerURL()}/fill-pdf-2`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
      .then((res) => res.blob())
      .catch((error) => {
        console.error(error);
        return null;
      });

    if (!responseBlob) return null;

    const filled = new File([responseBlob], 'FilledApplication.pdf', {
      type: 'application/pdf',
    });
    setPdfFile(filled);
    return filled;
  };

  /**
   * Legacy method: fetches registry + downloads blank PDF in one call.
   * Kept for backward compatibility with the existing preview-page flow.
   */
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
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error(error);
        });

      if (!registryInfo) {
        setPdfFile(null);
        return;
      }

      const pdfData = await fetch(`${getServerURL()}/download-file`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ fileType: 'FORM', fileId: registryInfo.blankFormId, targetUser: 'FACE-TO-FACE-ADMIN' }),
      })
        .then((res) => res.blob())
        .catch((error) => {
          console.error(error);
        });

      if (!pdfData) return;

      const file = new File([pdfData], 'FormPDF', {
        type: 'application/pdf',
      });

      setPdfFile(file);
      setIsDirty(false);
    }
  };

  return {
    pdfFile,
    blankFormId,
    registryLoading,
    registryError,
    postData,
    fetchRegistry,
    fillPdf,
  };
}
