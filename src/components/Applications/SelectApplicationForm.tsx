import React, { ChangeEvent, Component, FormEvent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

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

  const questionPageCount = Object.keys(formContent).length;

  const disablePrev = page === 0;

  const disableNext = page === questionPageCount - 1;

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
            <p>Step {page + 1} of {questionPageCount}</p>
          </div>

          {page === 3 && <h3>I am filling out this application on behalf of...</h3>}

          <Form className="form tw-flex tw-flex-wrap tw-gap-8 tw-justify-center" onSubmit={handleSubmit}>

            {formContent[page].options
              .filter((option) => option.for === null || option.for.has(data.type as ApplicationType))
              .map((option) => (
                <SelectApplicationCard
                  key={option.value}
                  iconSrc={option.iconSrc}
                  iconAlt={option.iconAlt}
                  titleText={option.titleText}
                  subtitleText={option.subtitleText}
                  clickHandler={() => setData((prev) => ({ ...prev, [option.dataAttr]: option.value }))}
                  checked={data[option.dataAttr] === option.value}
                  name={option.dataAttr}
                  value={option.value}
                  disabled={false}
                />
              ))}

          </Form>
          <div className="tw-flex tw-justify-between">
            <Button onClick={handlePrev} className={`${disablePrev ? 'tw-invisible ' : ' '}`}>Back</Button>
            <Button onClick={handleNext} className={`${disableNext ? 'tw-invisible ' : ' '}`}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
