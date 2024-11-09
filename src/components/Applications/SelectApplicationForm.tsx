import React, { ChangeEvent, Component, FormEvent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useNewApplicationFormContext from './NewApplicationFormHook';
import SelectApplicationCard from './SelectApplicationCard';

interface CardInfo {
  iconSrc: string,
  iconAlt: string,
  dataAttr: string,
  value: string,
  titleText: string,
  subtitleText: string | null,
}

const cards: Record<number, CardInfo[]> = {
  0: [
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'ssc',
      titleText: 'Social Security Card',
      subtitleText: null,
    },
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'ssc2',
      titleText: 'Social Security Card',
      subtitleText: null,
    },
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'ssc3',
      titleText: 'Social Security Card',
      subtitleText: null,
    },
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'ssc4',
      titleText: 'Social Security Card',
      subtitleText: null,
    },
  ],
  1: [
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA',
      titleText: 'Pennsylvania',
      subtitleText: null,
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA1',
      titleText: 'Pennsylvania',
      subtitleText: null,
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA2',
      titleText: 'Pennsylvania',
      subtitleText: null,
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA3',
      titleText: 'Pennsylvania',
      subtitleText: null,
    },
  ],
};

export default function SelectApplicationForm() {
  const {
    page,
    setPage,
    data,
    setData,
    titles,
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

            {cards[page].map((card) => (
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
