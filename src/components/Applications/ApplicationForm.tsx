import '../InteractiveForms/form-preview.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import PromptOnLeave from '../BaseComponents/PromptOnLeave';
import InteractiveFormWizard from '../InteractiveForms/InteractiveFormWizard';
import SignAndDownloadViewer from '../InteractiveForms/SignAndDownloadViewer';
import type { BuilderState } from '../InteractiveForms/types';
import { fillPdfBlob } from './api/interactiveForm';
import ApplicationCard from './ApplicationCard';
import { filterAvailableApplications } from './ApplicationOptionsFilter';
import ApplicationReviewPage from './ApplicationReviewPage';
import { ApplicationType, formContent as applicationFormPages, useApplicationFormContext } from './Hooks/ApplicationFormHook';
import useGetApplicationRegistry from './Hooks/UseGetApplicationRegistry';

function WebFormPageContent({
  blankFormId,
  fillingPdf,
  registryLoading,
  registryError,
  onBack,
  onWizardSubmit,
  onConfigLoaded,
  clientUsername,
  restoredFormData,
}: {
  blankFormId: string | null;
  fillingPdf: boolean;
  registryLoading: boolean;
  registryError: string | null;
  onBack: () => void;
  onWizardSubmit: (pdfFill: Record<string, unknown>, formOutput: Record<string, unknown>, formData: Record<string, unknown>) => void;
  onConfigLoaded: (config: { builderState: BuilderState | null; formTitle: string }) => void;
  clientUsername: string;
  restoredFormData?: Record<string, unknown> | null;
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
  return (
    <InteractiveFormWizard
      applicationId={blankFormId}
      clientUsername={clientUsername}
      onSubmit={onWizardSubmit}
      onConfigLoaded={onConfigLoaded}
      initialData={restoredFormData ?? undefined}
    />
  );
}

function getOptionLabel(pageName: 'type' | 'person', value: string): string | null {
  if (!value) return null;
  const pageConfig = applicationFormPages.find((entry) => entry.pageName === pageName);
  const option = pageConfig?.options.find((entry) => entry.value === value);
  return option?.titleText ?? null;
}

export default function ApplicationForm() {
  const {
    formContent,
    page,
    data,
    isDirty,
    setIsDirty,
    handleChange,
    handleNext,
    handlePrev,
    clientUsername,
    clientName,
  } = useApplicationFormContext();

  const [shouldPrompt, setShouldPrompt] = useState(true);
  const [fillingPdf, setFillingPdf] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [applicationAvailability, setApplicationAvailability] = useState<
    { type: string; state: string; situation: string; lookupKey: string }[]
  >([]);
  const [filledPdfUrl, setFilledPdfUrl] = useState<string | null>(null);
  const [wizardFormOutput, setWizardFormOutput] = useState<Record<string, unknown> | null>(null);
  const [wizardFormData, setWizardFormData] = useState<Record<string, unknown> | null>(null);
  const builderStateRef = useRef<BuilderState | null>(null);
  const formTitleRef = useRef<string>('');
  const {
    blankFormId,
    registryLoading,
    registryError,
    fetchRegistry,
  } = useGetApplicationRegistry();
  const history = useHistory();

  const pageCount = formContent.length;
  const hidePrev = page === 0;
  const isReviewPage = formContent[page].pageName === 'review';
  const isWebFormPage = formContent[page].pageName === 'webForm';
  const isSignAndDownloadPage = formContent[page].pageName === 'signAndDownload';

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

  const handleConfigLoaded = useCallback((config: { builderState: BuilderState | null; formTitle: string }) => {
    builderStateRef.current = config.builderState;
    formTitleRef.current = config.formTitle;
  }, []);

  const handleWizardSubmit = useCallback(
    async (pdfFill: Record<string, unknown>, formOutput: Record<string, unknown>, formData: Record<string, unknown>) => {
      if (!blankFormId || Object.keys(pdfFill).length === 0) {
        handleNext();
        return;
      }
      setFillingPdf(true);
      setSubmitError(null);
      try {
        const blob = await fillPdfBlob(blankFormId, pdfFill, clientUsername);
        const url = URL.createObjectURL(blob);
        setFilledPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setWizardFormOutput(formOutput);
        setWizardFormData(formData);
        handleNext();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Could not generate PDF. Please try again.');
      } finally {
        setFillingPdf(false);
      }
    },
    [blankFormId, clientUsername, handleNext],
  );

  const handleSaveSuccess = useCallback(() => {
    if (filledPdfUrl) URL.revokeObjectURL(filledPdfUrl);
    setFilledPdfUrl(null);
    setWizardFormOutput(null);
    setWizardFormData(null);
    disablePrompt();
    history.push('/applications');
  }, [filledPdfUrl, history]);

  useEffect(() => () => {
    if (filledPdfUrl) URL.revokeObjectURL(filledPdfUrl);
  }, [filledPdfUrl]);

  const clickHandler = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) {
      handleChange(e.target.name, e.target.value);
    }
  };

  const availableApplications = filterAvailableApplications(data, applicationAvailability);

  const dataAttr = formContent[page].dataAttr;
  const applicationTypeLabel = getOptionLabel('type', data.type) ?? 'your';
  const targetPersonLabel = clientName || clientUsername || getOptionLabel('person', data.person) || 'you';
  const pageTitle = isWebFormPage
    ? `Fill out ${applicationTypeLabel} application for ${targetPersonLabel}`
    : formContent[page].title(data.type);

  return (
    <>
      <PromptOnLeave shouldPrompt={shouldPrompt} />
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      {/* Form content: narrower for readability */}
      <div className="tw-max-w-4xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-pt-10 tw-pb-12">
        <div className={`tw-flex tw-justify-between tw-items-end ${isWebFormPage ? 'tw-mb-6' : 'tw-mb-1'}`}>
          <h2 className="tw-text-2xl tw-font-semibold tw-m-0">{pageTitle}</h2>
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
            onWizardSubmit={handleWizardSubmit}
            onConfigLoaded={handleConfigLoaded}
            clientUsername={clientUsername}
            restoredFormData={wizardFormData}
          />
        )}

        {isSignAndDownloadPage && filledPdfUrl && blankFormId && wizardFormOutput && (
          <SignAndDownloadViewer
            fileUrl={filledPdfUrl}
            signaturePlacements={builderStateRef.current?.signaturePlacements ?? []}
            title={formTitleRef.current}
            applicationId={blankFormId}
            formAnswers={wizardFormOutput}
            clientUsername={clientUsername}
            onSaveSuccess={handleSaveSuccess}
          />
        )}

        {isSignAndDownloadPage && !filledPdfUrl && (
          <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center tw-border tw-rounded tw-text-gray-500">
            Please complete the form on the previous step to generate your PDF.
          </div>
        )}

        {submitError && (isWebFormPage || isSignAndDownloadPage) && (
          <Alert variant="danger" className="tw-mt-4" onClose={() => setSubmitError(null)} dismissible>
            {submitError}
          </Alert>
        )}

        <div className="tw-flex tw-justify-between tw-mt-6">
          <Button
            onClick={handlePrev}
            className={`${hidePrev ? 'tw-invisible ' : ' '} ${isWebFormPage || availabilityLoading ? 'tw-hidden ' : ' '}`}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              setSubmitError(null);
              handleNext();
            }}
            className={`${isReviewPage ? ' ' : 'tw-hidden '}`}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
