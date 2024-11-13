import React, { ChangeEvent, Component, FormEvent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import DocumentViewer from '../Documents/DocumentViewer';
import useNewApplicationFormContext from './NewApplicationFormHook';
import { ApplicationType } from './NewApplicationFormProvider';
import SelectApplicationCard from './SelectApplicationCard';

export default function SelectApplicationForm() {
  const {
    page,
    setPage,
    data,
    setData,
    formContent,
  } = useNewApplicationFormContext();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(JSON.stringify('test'));
  };

  const handlePrev = () => setPage((prev) => prev - 1);

  const handleNext = () => setPage((prev) => prev + 1);

  const pageCount = Object.keys(formContent).length;

  const hidePrev = page === 0;

  const disableNext = page === 6;

  const isPreviewPage = page === pageCount - 2;
  const isFinalPage = page === pageCount - 1;

  return (
    <div className="container-fluid">
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron jumbotron-fluid bg-white pb-0">
        <div className="container tw-flex tw-flex-col tw-gap-4">
          <div className="tw-flex tw-justify-between tw-items-end">
            <h1>{formContent[page].title}</h1>
            <p>Step {page + 1} of {pageCount}</p>
          </div>

          {formContent[page].subtitle && <h3>{formContent[page].subtitle}</h3>}

          <Form className="form tw-flex tw-flex-wrap tw-gap-8 tw-justify-center" onSubmit={handleSubmit}>

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
                  clickHandler={() => setData((prev) => ({ ...prev, [formContent[page].dataAttr!]: option.value }))}
                  checked={data[formContent[page].dataAttr!] === option.value}
                  name={formContent[page].dataAttr!}
                  value={option.value}
                  disabled={false}
                />
              ))}

          </Form>

          {isPreviewPage && (
            <DocumentViewer pdfFile={new File([new Blob()], 'test')} />
          )}

          {isFinalPage && (
            <div>
              <h5>This is the final page</h5>
              <ul>
                <li>{data.type}</li>
                <li>{data.state}</li>
                <li>{data.situation}</li>
                <li>{data.person}</li>
              </ul>
            </div>
          )}

          <div className="tw-flex tw-justify-between">
            <Button onClick={handlePrev} className={`${hidePrev ? 'tw-invisible ' : ' '}`}>Back</Button>
            <Button onClick={handleNext} className={`${disableNext ? 'tw-invisible ' : ' '}`}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
