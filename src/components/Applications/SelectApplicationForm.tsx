import React, { ChangeEvent, Component, FormEvent, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import DocumentViewer from '../Documents/DocumentViewer';
import useNewApplicationFormContext from './NewApplicationFormHook';
import { ApplicationType } from './NewApplicationFormProvider';
import SelectApplicationCard from './SelectApplicationCard';
import SelectApplicationFormFinalPage from './SelectApplicationFormFinalPage';

export default function SelectApplicationForm() {
  const {
    page,
    setPage,
    data,
    setData,
    formContent,
    handleChange,
    handleNext,
    handlePrev,
  } = useNewApplicationFormContext();

  const handleSubmit = () => {
    console.log('submit', JSON.stringify(data));
  };

  const handleSaveOnly = () => {
    console.log('save only', JSON.stringify(data));
  };

  const [previewPdf, setPreviewPdf] = useState<File | null>(null);

  const pageCount = Object.keys(formContent).length;

  const hidePrev = page === 0;

  const isPreviewPage = page === pageCount - 2;
  const isFinalPage = page === pageCount - 1;

  // const canGoToNext = formContent[page].dataAttr ? Boolean(data[formContent[page].dataAttr]) : true;

  return (
    <div className="container-fluid">
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron jumbotron-fluid bg-white pb-0">
        <div className="container tw-flex tw-flex-col tw-gap-4">
          <div className="tw-flex tw-justify-between tw-items-end">
            <h1>{formContent[page].title(data.type)}</h1>
            <p>Step {page + 1} of {pageCount}</p>
          </div>

          {formContent[page].subtitle && <h3>{formContent[page].subtitle}</h3>}

          <Form className="form tw-grid tw-gap-4 tw-justify-center tw-grid-cols-2">

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
                  clickHandler={handleChange}
                  checked={data[formContent[page].dataAttr!] === option.value}
                  name={formContent[page].dataAttr!}
                  value={option.value}
                  disabled={false}
                />
              ))}

          </Form>

          {isPreviewPage && (
            previewPdf
              ? <DocumentViewer pdfFile={previewPdf} />
              : <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center border !tw-rounded-none">Loading...</div>
          )}

          {isFinalPage && (
            <SelectApplicationFormFinalPage
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
              className={`${isPreviewPage ? ' ' : 'tw-hidden '}`}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
