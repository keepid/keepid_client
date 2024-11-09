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
    titles,
    cards,
  } = useNewApplicationFormContext();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(JSON.stringify('test'));
  };

  const handlePrev = () => setPage((prev) => prev - 1);

  const handleNext = () => setPage((prev) => prev + 1);

  const disablePrev = page === 0;

  const disableNext = page === Object.keys(titles).length - 1;

  return (
    <div className="container-fluid">
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron jumbotron-fluid bg-white pb-0">
        <div className="container tw-flex tw-flex-col tw-gap-4">
          <h1>{titles[page]}</h1>
          <Form className="form tw-flex tw-flex-wrap tw-gap-8 tw-justify-center" onSubmit={handleSubmit}>

            {cards[page]
              .filter((card) => card.for === null || card.for.has(data.applicationType as ApplicationType))
              .map((card) => (
                <SelectApplicationCard
                  key={card.value}
                  iconSrc={card.iconSrc}
                  iconAlt={card.iconAlt}
                  titleText={card.titleText}
                  subtitleText={card.subtitleText}
                  clickHandler={() => setData((prev) => ({ ...prev, [card.dataAttr]: card.value }))}
                  checked={data[card.dataAttr] === card.value}
                  name={card.dataAttr}
                  value={card.value}
                  disabled={false}
                />
              ))}

          </Form>
          <div className="tw-flex tw-justify-between">
            <Button disabled={disablePrev} onClick={handlePrev}>Back</Button>
            <Button disabled={disableNext} onClick={handleNext}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
