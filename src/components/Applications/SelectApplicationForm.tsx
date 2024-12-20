import React, { ChangeEvent, Component, FormEvent, useEffect, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';

import DocumentViewer from '../Documents/DocumentViewer';
<<<<<<< HEAD
import ApplicationBreadCrumbs from './ApplicationBreadCrumbs';
=======
import EnhancedPrompt from './EnhancedPrompt';
>>>>>>> 6e719945 (onChange changed to onClick, added warnings before navigating away)
import useNewApplicationFormContext from './NewApplicationFormHook';
import { ApplicationType } from './NewApplicationFormProvider';
import SelectApplicationCard from './SelectApplicationCard';
import SelectApplicationFormFinalPage from './SelectApplicationFormFinalPage';

export default function SelectApplicationForm() {
  const {
    formContent,
    page,
    setPage,
    data,
<<<<<<< HEAD
    setData,
<<<<<<< HEAD
    pages,
    setPages,
=======
>>>>>>> 6e719945 (onChange changed to onClick, added warnings before navigating away)
    formContent,
=======
>>>>>>> 65562e29 (Update breadcrumbs to progress bar; enlarge text; add selection descriptors)
    handleChange,
    handleNext,
    handlePrev,
  } = useNewApplicationFormContext();

  const [shouldPrompt, setShouldPrompt] = useState(true);
  const history = useHistory();

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

  const [previewPdf, setPreviewPdf] = useState<File | null>(null);

  const pageCount = Object.keys(formContent).length;

  const hidePrev = page === 0;

  const isPreviewPage = page === pageCount - 3;
  const isPDFPage = page === pageCount - 2;
  const isFinalPage = page === pageCount - 1;

  // const canGoToNext = formContent[page].dataAttr ? Boolean(data[formContent[page].dataAttr]) : true;

  return (
<<<<<<< HEAD
    <div className="container-fluid">
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron jumbotron-fluid bg-white pb-0 tw-mt-0 tw-pt-6">
        <div className="container tw-flex tw-flex-col tw-gap-4">
          <ApplicationBreadCrumbs pages={pages} />
          <div className="tw-flex tw-justify-between tw-items-end">
            <h1>{formContent[page].title(data.type)}</h1>
            <p>Step {page + 1} of {pageCount}</p>
          </div>
=======
    <>
      <EnhancedPrompt shouldPrompt={shouldPrompt} />
      <div className="container-fluid">
        <Helmet>
          <title>Create new application</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
<<<<<<< HEAD
        <div className="jumbotron jumbotron-fluid bg-white pb-0">
=======
        <ApplicationBreadCrumbs page={page} setPage={setPage} data={data} />
        <div className="jumbotron jumbotron-fluid bg-white pb-0 tw-mt-0 tw-pt-6">
>>>>>>> 65562e29 (Update breadcrumbs to progress bar; enlarge text; add selection descriptors)
          <div className="container tw-flex tw-flex-col tw-gap-4">
            <div className="tw-flex tw-justify-between tw-items-end">
              <h1>{formContent[page].title(data.type)}</h1>
              <p>Step {page + 1} of {pageCount}</p>
            </div>
>>>>>>> 6e719945 (onChange changed to onClick, added warnings before navigating away)

            {formContent[page].subtitle && <h3>{formContent[page].subtitle}</h3>}

            <Form
              className="form tw-grid tw-gap-4 tw-justify-center tw-grid-cols-2"
              onClick={clickHandler}
            >

              {formContent[page].dataAttr &&
              formContent[page].options
                .filter((option) => option.for === null || option.for.has(data.type as ApplicationType))
                .map((option) => (
                  <SelectApplicationCard
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

            {isPreviewPage && (
              <ul className="tw-text-lg">
                <li>This is a {data.type} application.</li>
                <li>This application is for {data.person}</li>
                <li>The applicant is applying in {data.state}</li>
                <li>The applicant&apos;s situation is {data.situation}</li>
              </ul>
            )}

            {isPDFPage && (
              previewPdf
                ? <DocumentViewer pdfFile={previewPdf} />
                : <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center border !tw-rounded-none">PDF goes here...</div>
            )}

            {isFinalPage && (
              <SelectApplicationFormFinalPage
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
                className={`${hidePrev ? 'tw-invisible ' : ' '} ${isFinalPage ? 'tw-hidden ' : ' '}`}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className={`${isPreviewPage || isPDFPage ? ' ' : 'tw-hidden '}`}
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
