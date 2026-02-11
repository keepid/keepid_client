import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

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

function WebFormPageContent({
  blankFormId,
  fillingPdf,
  onSubmit,
  clientUsername,
}: {
  blankFormId: string | null;
  fillingPdf: boolean;
  onSubmit: (formAnswers: Record<string, any>) => void;
  clientUsername: string;
}) {
  if (!blankFormId || fillingPdf) {
    const label = fillingPdf ? 'Generating your application...' : 'Loading form...';
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">{label}</span>
        </Spinner>
      </div>
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
  const {
    pdfFile,
    blankFormId,
    fetchRegistry,
    fillPdf,
    postData: postRegistryData,
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
  }, [isWebFormPage]);

  const disablePrompt = () => {
    flushSync(() => {
      setShouldPrompt(false);
    });
  };

  const handleSubmit = () => {
    disablePrompt();
    console.log('submit', JSON.stringify(data));
  };

  const handleSaveOnly = () => {
    disablePrompt();
    console.log('save only', JSON.stringify(data));
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
      // If form was skipped (empty answers) or blankFormId not available, just advance
      if (!blankFormId || Object.keys(formAnswers).length === 0) {
        handleNext();
        return;
      }
      setFillingPdf(true);
      await fillPdf(blankFormId, formAnswers, clientUsername);
      setFillingPdf(false);
      handleNext();
    },
    [blankFormId, fillPdf, handleNext, clientUsername],
  );

  const availableApplications = filterAvailableApplications(data);

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
            onSubmit={handleWebFormSubmit}
            clientUsername={clientUsername}
          />
        )}

        {isPreviewPage && (
          pdfFile
            ? <DocumentViewer pdfFile={pdfFile} />
            : <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center tw-border tw-rounded">Sorry, the PDF is not available for the application you selected.</div>
        )}

        {isSendPage && (
          <ApplicationSendPage
            data={data}
            handleCancel={handleCancel}
            handlePrev={handlePrev}
            handleSaveOnly={handleSaveOnly}
            handleSubmit={handleSubmit}
          />
        )}

        <div className="tw-flex tw-justify-between tw-mt-6">
          <Button
            onClick={handlePrev}
            className={`${hidePrev ? 'tw-invisible ' : ' '} ${isSendPage || isWebFormPage ? 'tw-hidden ' : ' '}`}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className={`${isReviewPage || isPreviewPage ? ' ' : 'tw-hidden '}`}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
