import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import PromptOnLeave from '../BaseComponents/PromptOnLeave';
import DocumentViewer from '../Documents/DocumentViewer';
import ApplicationBreadCrumbs from './ApplicationBreadCrumbs';
import ApplicationCard from './ApplicationCard';
import ApplicationSendPage from './ApplicationSendPage';
import { ApplicationType, useApplicationFormContext } from './Hooks/ApplicationFormHook';
import useGetApplicationRegistry from './Hooks/UseGetApplicationRegistry';

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
  } = useApplicationFormContext();

  const [shouldPrompt, setShouldPrompt] = useState(true);
  const [previewPdf, setPreviewPdf] = useState<File | null>(null);
  const { response: registryResponse, postData: postRegistryData } = useGetApplicationRegistry();
  const history = useHistory();

  const pageCount = formContent.length;
  const hidePrev = page === 0;
  const isReviewPage = formContent[page].pageName === 'review';
  const isPreviewPage = formContent[page].pageName === 'preview';
  const isSendPage = formContent[page].pageName === 'send';

  useEffect(() => {
    if (isPreviewPage) {
      postRegistryData(
        data,
        isDirty,
        setIsDirty,
      );
    }
  }, [isPreviewPage]);

  // TODO: do something with the response, or remove this
  useEffect(() => {
    console.log(registryResponse);
  }, [registryResponse]);

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
              onClick={clickHandler}
            >

              {formContent[page].dataAttr &&
                formContent[page].options
                  .filter((option) => option.for === null || option.for.has(data.type as ApplicationType))
                  .map((option) => (
                    <ApplicationCard
                      key={option.value}
                      iconSrc={option.iconSrc}
                      iconAlt={option.iconAlt}
                      titleText={option.titleText}
                      subtitleText={option.subtitleText}
                      checked={data[formContent[page].dataAttr!] === option.value}
                      name={formContent[page].dataAttr!}
                      value={option.value}
                      disabled={false}
                    />
                  ))}

            </Form>

            {isReviewPage && (
              <ul className="tw-text-lg">
                <li>This is a {data.type} application.</li>
                <li>This application is for {data.person}</li>
                <li>The applicant is applying in {data.state}</li>
                <li>The applicant&apos;s situation is {data.situation}</li>
              </ul>
            )}

            {isPreviewPage && (
              previewPdf
                ? <DocumentViewer pdfFile={previewPdf} />
                : <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center border !tw-rounded-none">PDF goes here...</div>
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
                className={`${hidePrev ? 'tw-invisible ' : ' '} ${isSendPage ? 'tw-hidden ' : ' '}`}
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
