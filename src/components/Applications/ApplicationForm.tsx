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
      <div className="container-fluid">
        <Helmet>
          <title>Create new application</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <ApplicationBreadCrumbs page={page} setPage={setPage} data={data} />
        <div className="jumbotron jumbotron-fluid bg-white pb-0 tw-mt-0 tw-pt-6">
          <div className="container tw-flex tw-flex-col tw-gap-4">
            <div className="tw-flex tw-justify-between tw-items-end">
              <h1>{formContent[page].title(data.type)}</h1>
              <p>Step {page + 1} of {pageCount}</p>
            </div>

            {formContent[page].subtitle && <h3>{formContent[page].subtitle}</h3>}

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
                : <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center border !tw-rounded-none">Sorry, the PDF is not available for the application you selected.</div>
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

            <div className="tw-flex tw-justify-between">
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
        </div>
      </div>
    </>
  );
}
