import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import SignaturePad from '../../lib/SignaturePad';
import getServerURL from '../../serverOverride';
import PromptOnLeave from '../BaseComponents/PromptOnLeave';
import DocumentViewer from '../Documents/DocumentViewer';
import ApplicationBreadCrumbs from './ApplicationBreadCrumbs';
import ApplicationCard from './ApplicationCard';
import { filterAvailableApplications } from './ApplicationOptionsFilter';
import ApplicationReviewPage from './ApplicationReviewPage';
import ApplicationSendPage from './ApplicationSendPage';
import ApplicationWebForm from './ApplicationWebForm';
import { ApplicationType, useApplicationFormContext } from './Hooks/ApplicationFormHook';
import useGetApplicationRegistry from './Hooks/UseGetApplicationRegistry';

// Convert a data-URL (e.g. from canvas.toDataURL()) to a Blob suitable for FormData
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n >= 0) {
    n -= 1;
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: 'image/png' });
}

function WebFormPageContent({
  blankFormId,
  fillingPdf,
  registryLoading,
  registryError,
  onBack,
  onSubmit,
  clientUsername,
}: {
  blankFormId: string | null;
  fillingPdf: boolean;
  registryLoading: boolean;
  registryError: string | null;
  onBack: () => void;
  onSubmit: (formAnswers: Record<string, any>) => void;
  clientUsername: string;
}) {
  if (registryLoading || fillingPdf) {
    const label = fillingPdf ? 'Generating your application...' : 'Loading form...';
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">{label}</span>
        </Spinner>
      </div>
    );
  }
  if (registryError) {
    return (
      <Alert variant="warning" className="tw-mt-4">
        <div>{registryError}</div>
        <Button variant="outline-secondary" className="tw-mt-3" onClick={onBack}>
          Back to selections
        </Button>
      </Alert>
    );
  }
  if (!blankFormId) {
    return (
      <Alert variant="warning" className="tw-mt-4">
        Could not load this application. Please go back and pick a different option.
      </Alert>
    );
  }
  return <ApplicationWebForm applicationId={blankFormId} clientUsername={clientUsername} onSubmit={onSubmit} />;
}

export default function ApplicationForm() {
  const {
    formContent,
    page,
    setPage,
    data,
    isDirty,
    setIsDirty,
    handleChange,
    handleNext,
    handlePrev,
    clientUsername,
  } = useApplicationFormContext();

  const [shouldPrompt, setShouldPrompt] = useState(true);
  const [fillingPdf, setFillingPdf] = useState(false);
  const [savedFormAnswers, setSavedFormAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [applicationAvailability, setApplicationAvailability] = useState<
    { type: string; state: string; situation: string; lookupKey: string }[]
  >([]);
  const {
    pdfFile,
    blankFormId,
    registryLoading,
    registryError,
    fetchRegistry,
    fillPdf,
  } = useGetApplicationRegistry();
  const history = useHistory();

  const pageCount = formContent.length;
  const hidePrev = page === 0;
  const isReviewPage = formContent[page].pageName === 'review';
  const isWebFormPage = formContent[page].pageName === 'webForm';
  const isPreviewPage = formContent[page].pageName === 'preview';
  const isSendPage = formContent[page].pageName === 'send';

  // Fetch registry info (blankFormId) when entering the webForm step
  useEffect(() => {
    if (isWebFormPage) {
      fetchRegistry(data, isDirty, setIsDirty);
    }
  }, [isWebFormPage, data, isDirty]);

  useEffect(() => {
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    fetch(`${getServerURL()}/get-available-application-options`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((items) => {
        if (!Array.isArray(items)) {
          setApplicationAvailability([]);
          setAvailabilityError('Could not load application options.');
          return;
        }
        setApplicationAvailability(
          items
            .filter((x) => x && x.type && x.state && x.situation)
            .map((x) => ({
              type: String(x.type),
              state: String(x.state),
              situation: String(x.situation),
              lookupKey: String(x.lookupKey || `${x.type}$${x.state}$${x.situation}`),
            })),
        );
      })
      .catch(() => {
        setApplicationAvailability([]);
        setAvailabilityError('Could not load application options.');
      })
      .finally(() => setAvailabilityLoading(false));
  }, []);

  const disablePrompt = () => {
    flushSync(() => {
      setShouldPrompt(false);
    });
  };

  /** Upload the signed PDF to the server. Returns true on success. */
  const uploadSignedPdf = async (): Promise<boolean> => {
    if (!blankFormId) {
      setSubmitError('Application ID is missing. Please go back and try again.');
      return false;
    }

    if (!signatureDataUrl) {
      setSubmitError('Please sign the application on the previous step before submitting.');
      return false;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const signatureBlob = dataURLtoBlob(signatureDataUrl);

      const formData = new FormData();
      formData.append('signature', signatureBlob, 'signature.png');
      formData.append('clientUsername', clientUsername);
      formData.append('applicationId', blankFormId);
      formData.append('formAnswers', JSON.stringify(savedFormAnswers));

      const response = await fetch(`${getServerURL()}/upload-signed-pdf-2`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.status !== 'SUCCESS') {
        setSubmitError(result.message || 'Failed to save application. Please try again.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Upload failed:', err);
      setSubmitError('Could not connect to the server. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const success = await uploadSignedPdf();
    if (success) {
      disablePrompt();
      // TODO: optionally call /submit-mail here for direct-mail flow
      history.push('/applications');
    }
  };

  const handleSaveOnly = async () => {
    const success = await uploadSignedPdf();
    if (success) {
      disablePrompt();
      history.push('/applications');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Do you really want to cancel this application?')) {
      disablePrompt();
      history.push('/applications');
    }
  };

  const clickHandler = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) {
      handleChange(e.target.name, e.target.value);
    }
  };

  // Called when user submits the web form -- fills the PDF and advances to preview
  const handleWebFormSubmit = useCallback(
    async (formAnswers: Record<string, any>) => {
      // Persist answers so they're available at final submission
      setSavedFormAnswers(formAnswers);

      // If form was skipped (empty answers) or blankFormId not available, just advance
      if (!blankFormId || Object.keys(formAnswers).length === 0) {
        handleNext();
        return;
      }
      setFillingPdf(true);
      setSubmitError(null);
      const filledPdf = await fillPdf(blankFormId, formAnswers, clientUsername);
      setFillingPdf(false);
      if (!filledPdf) {
        setSubmitError('Could not generate preview PDF. Please review form answers and try again.');
        return;
      }
      handleNext();
    },
    [blankFormId, fillPdf, handleNext, clientUsername],
  );

  const availableApplications = filterAvailableApplications(data, applicationAvailability);

  const dataAttr = formContent[page].dataAttr;

  return (
    <>
      <PromptOnLeave shouldPrompt={shouldPrompt} />
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      {/* Breadcrumbs: wider than the form so they have room to breathe */}
      <div className="tw-max-w-6xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <ApplicationBreadCrumbs page={page} setPage={setPage} />
      </div>

      {/* Form content: narrower for readability */}
      <div className="tw-max-w-4xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-pb-12">
        <div className="tw-flex tw-justify-between tw-items-end tw-mb-1">
          <h2 className="tw-text-2xl tw-font-semibold tw-m-0">{formContent[page].title(data.type)}</h2>
          <span className="tw-text-sm tw-text-gray-400">Step {page + 1} of {pageCount}</span>
        </div>

        {formContent[page].subtitle && (
          <p className="tw-text-gray-500 tw-mb-4">{formContent[page].subtitle}</p>
        )}
        {availabilityError && (
          <Alert variant="warning" className="tw-mb-4">
            {availabilityError}
          </Alert>
        )}

        <Form
          className="form tw-grid tw-gap-4 tw-justify-center tw-grid-cols-2"
          style={{
            gridTemplateColumns: formContent[page].cols && `repeat(${formContent[page].cols}, minmax(0, 1fr))`,
            gridTemplateRows: formContent[page].rows && `repeat(${formContent[page].rows}, minmax(0, 1fr))`,
          }}
          onClick={clickHandler}
        >
          {dataAttr &&
            formContent[page].options
              .filter((option) => option.for === null || option.for.has(data.type as ApplicationType))
              .map((option) => (
                <ApplicationCard
                  key={option.value}
                  iconSrc={option.iconSrc}
                  iconAlt={option.iconAlt}
                  titleText={option.titleText}
                  subtitleText={option.subtitleText}
                  checked={data[dataAttr] === option.value}
                  name={dataAttr}
                  value={option.value}
                  disabled={dataAttr !== 'person' && !(availableApplications.some((a) => a[dataAttr] === option.value))}
                />
              ))}
        </Form>

        {isReviewPage && <ApplicationReviewPage data={data} />}

        {isWebFormPage && (
          <WebFormPageContent
            blankFormId={blankFormId}
            fillingPdf={fillingPdf}
            registryLoading={registryLoading}
            registryError={registryError}
            onBack={handlePrev}
            onSubmit={handleWebFormSubmit}
            clientUsername={clientUsername}
          />
        )}

        {isPreviewPage && (
          pdfFile
            ? (
              <>
                <DocumentViewer pdfFile={pdfFile} readOnly />
                <div className="tw-mt-8">
                  <h4 className="tw-font-semibold tw-mb-2">Sign your application</h4>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-2">
                    Draw your signature in the box below. You can clear and redo it if needed.
                  </p>
                  <div className="tw-border tw-border-gray-300 tw-rounded" style={{ height: 200 }}>
                    <SignaturePad
                      canvasDataUrl={signatureDataUrl}
                      handleCanvasSign={(dataUrl: string) => setSignatureDataUrl(dataUrl)}
                      onEnd={(_event: any, dataUrl: string) => setSignatureDataUrl(dataUrl)}
                    />
                  </div>
                </div>
              </>
            )
            : <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center tw-border tw-rounded">Sorry, the PDF is not available for the application you selected.</div>
        )}

        {submitError && (isWebFormPage || isPreviewPage || isSendPage) && (
          <Alert variant="danger" className="tw-mt-4" onClose={() => setSubmitError(null)} dismissible>
            {submitError}
          </Alert>
        )}

        {isSendPage && (
          <ApplicationSendPage
            data={data}
            handleCancel={handleCancel}
            handlePrev={handlePrev}
            handleSaveOnly={handleSaveOnly}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        <div className="tw-flex tw-justify-between tw-mt-6">
          <Button
            onClick={handlePrev}
            className={`${hidePrev ? 'tw-invisible ' : ' '} ${isSendPage || isWebFormPage || availabilityLoading ? 'tw-hidden ' : ' '}`}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (isPreviewPage && !signatureDataUrl) {
                setSubmitError('Please sign the application before continuing.');
                return;
              }
              setSubmitError(null);
              handleNext();
            }}
            className={`${isReviewPage || isPreviewPage ? ' ' : 'tw-hidden '}`}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
