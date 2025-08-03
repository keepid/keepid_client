import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
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
  // const [previewPdf, setPreviewPdf] = useState<File | null>(null);
  const { pdfFile, postData: postRegistryData } = useGetApplicationRegistry();
  const history = useHistory();

  const pageCount = formContent.length;
  const hidePrev = page === 0;
  const isReviewPage = formContent[page].pageName === 'review';
  const isPreviewPage = formContent[page].pageName === 'preview';
  const isSendPage = formContent[page].pageName === 'send';
  const MAX_Q_PER_PAGE = 10;

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
  // useEffect(() => {
  //   console.log(registryResponse);
  // }, [registryResponse]);

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
