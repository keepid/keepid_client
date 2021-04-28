import classNames from 'classnames';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Access from '../../static/images/access-data.svg';
import FileCloud from '../../static/images/file-cloud.svg';
import SignUp from '../../static/images/sign-up.svg';
import Spreadsheet from '../../static/images/spreadsheet.svg';
import SyncFiles from '../../static/images/sync-files.svg';

const clientJourneyMessages = defineMessages({
  header: {
    id: 'home.client-journey.header',
    defaultMessage: 'Meaningful Client Journeys',
  },
  subHeader: {
    id: 'home.client-journey.sub-header',
    defaultMessage: 'Prioritizing the user experience and alleviating pain points.',
  },

  step1Header: {
    id: 'home.client-journey.step-1-header',
    defaultMessage: 'Step #1: Registration',
  },
  step1Detail: {
    id: 'home.client-journey.step-1-detail',
    defaultMessage:
            'Homeless create a Keep.id account at participating nonprofits. Nonprofits then help homeless obtain missing identification.',
  },
  step2Header: {
    id: 'home.client-journey.step-2-header',
    defaultMessage: 'Step #2: Uploading',
  },
  step2Detail: {
    id: 'home.client-journey.step-2-detail',
    defaultMessage:
            'Government identification, personal information, and prison health records are securely uploaded to our cloud databases. These documents are also cryptographically signed and encrypted.',
  },
  step3Header: {
    id: 'home.client-journey.step-3-header',
    defaultMessage: 'Step #3: Access',
  },
  step3Detail: {
    id: 'home.client-journey.step-3-detail',
    defaultMessage: 'Those experiencing homelessness can access their documents at public or nonprofit computers.',
  },
  step4Header: {
    id: 'home.client-journey.step-4-header',
    defaultMessage: 'Step #4: Harnessing Data: Clients',
  },
  step4Detail: {
    id: 'home.client-journey.step-4-detail',
    defaultMessage:
            'Those experiencing homelessness (we call them clients) can now use their data to apply for jobs, print their documents, and send autofilled aid applications.',
  },

  step5Header: {
    id: 'home.client-journey.step-5-header',
    defaultMessage: 'Step #5: Harnessing Data: Nonprofits',
  },
  step5Detail: {
    id: 'home.client-journey.step-5-detail',
    defaultMessage:
            'Those experiencing homelessness (we call them clients) can now use their data to apply for jobs, print their documents, and send autofilled aid applications.',
  },

  carouselNext: {
    id: 'home.client-journey.carousel-next',
    defaultMessage: 'Next',
  },
  carouselPrevious: {
    id: 'home.client-journey.carousel-previous',
    defaultMessage: 'Previous',
  },
});

const ClientJourneys = () => {
  const intl = useIntl();
  return (
    <div className="bg-secondary">
      <div className="container">
        <div className="jumbotron jumbotron-fluid bg-transparent text-center pb-2 mb-2">
          <h1 className="display-5 text-light">{intl.formatMessage(clientJourneyMessages.header)}</h1>
          <p className="lead text-light">{intl.formatMessage(clientJourneyMessages.subHeader)}</p>
        </div>
        <div id="carouselExampleCaptions" className="carousel slide" data-ride="carousel">
          <ol className="carousel-indicators">
            <li data-target="#carouselExampleCaptions" data-slide-to="0" className="active" />
            <li data-target="#carouselExampleCaptions" data-slide-to="1" />
            <li data-target="#carouselExampleCaptions" data-slide-to="2" />
            <li data-target="#carouselExampleCaptions" data-slide-to="3" />
            <li data-target="#carouselExampleCaptions" data-slide-to="4" />
          </ol>
          <div className="carousel-inner">
            <CarouselItem
              active
              img={SignUp}
              header={intl.formatMessage(clientJourneyMessages.step1Header)}
              detail={intl.formatMessage(clientJourneyMessages.step1Detail)}
            />
            <CarouselItem
              img={SyncFiles}
              header={intl.formatMessage(clientJourneyMessages.step2Header)}
              detail={intl.formatMessage(clientJourneyMessages.step2Detail)}
            />
            <CarouselItem
              img={Access}
              header={intl.formatMessage(clientJourneyMessages.step3Header)}
              detail={intl.formatMessage(clientJourneyMessages.step3Detail)}
            />
            <CarouselItem
              img={FileCloud}
              header={intl.formatMessage(clientJourneyMessages.step4Header)}
              detail={intl.formatMessage(clientJourneyMessages.step4Detail)}
            />
            <CarouselItem
              img={Spreadsheet}
              header={intl.formatMessage(clientJourneyMessages.step5Header)}
              detail={intl.formatMessage(clientJourneyMessages.step5Detail)}
            />
          </div>
          <a
            className="carousel-control-prev"
            href="#carouselExampleCaptions"
            role="button"
            data-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="sr-only">{intl.formatMessage(clientJourneyMessages.carouselPrevious)}</span>
          </a>
          <a
            className="carousel-control-next"
            href="#carouselExampleCaptions"
            role="button"
            data-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="sr-only">{intl.formatMessage(clientJourneyMessages.carouselNext)}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line react/require-default-props
const CarouselItem = (props: { active?: boolean; img: string; header: string; detail: string }): JSX.Element => {
  const className = classNames({
    'carousel-item': true,
    active: props.active,
  });
  return (
    <div className={className}>
      <img src={props.img} className="d-block w-100 mx-auto my-4 d-block home-svgs" alt="..." />
      <h4 className="text-center text-white">{props.header}</h4>
      <p className="text-center text-light pb-5 w-50 mx-auto">{props.detail}</p>
    </div>
  );
};

export default ClientJourneys;
