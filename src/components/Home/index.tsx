import React from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import HomepageGraphic from '../../static/images/homepage_graphic.svg';
import PrivacyRafiki from '../../static/images/privacy-policy-rafiki.svg';
import EnsuringSecurity from './EnsuringSecurity';
import FocusingOnPeople from './FocusingOnPeople';
import HomelessStats from './HomelessStats';
import IntroText from './IntroText';
import WhoWeAreServing from './WhoWeAreServing';

const messages = defineMessages({
  title: {
    id: 'home.title',
    defaultMessage: 'Welcome',
    description: 'Home welcome message',
  },
  brandHeader: {
    id: 'home.brand-header',
    defaultMessage: 'An identification platform',
    description: 'The tagline shown on the home page',
  },
  subHeader: {
    id: 'home.sub-header',
    defaultMessage: 'for those experiencing homelessness',
  },
  getStarted: { id: 'home.get-started', defaultMessage: 'Get Started' },
  learnMore: { id: 'home.learn-more', defaultMessage: 'Donate' },
});

function Home() {
  const intl = useIntl();

  return (
    <div>
      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      {/* <StatementOfSolidarity /> */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-bg-[#445FEB]">
        <div className="tw-flex tw-flex-col tw-justify-center tw-px-8 tw-py-16 md:tw-w-1/2 md:tw-items-center md:tw-h-screen md:tw-text-center md:tw-px-0 md:tw-py-0">
          <h1 className="hero-subtext tw-text-white tw-font-bold tw-text-4xl md:tw-text-5xl">
            Welcome to keep.id!
          </h1>
          <h1 className="hero-subtext tw-text-white tw-text-3xl tw-text-left tw-pt-6 md:tw-text-4xl md:tw-text-center md:tw-font-bold">
            An identification platform for those experiencing homelessness
          </h1>
          <div className="tw-hidden md:tw-block">
            <img
              alt="Privacy Rafiki"
              src={PrivacyRafiki}
            />
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-justify-center tw-bg-white tw-rounded-tl-[60px] tw-rounded-tr-[60px] md:tw-w-1/2 md:tw-items-center md:tw-h-screen md:tw-text-center md:tw-rounded-tl-3xl md:tw-rounded-tr-[0px] md:tw-rounded-bl-3xl">
          <div className="hero-subtext tw-items-center tw-justify-center tw-text-4xl tw-font-semibold tw-text-[#43546F] tw-px-16 tw-pt-20 tw-pb-8 md:tw-text-3xl md:tw-font-bold md:tw-px-0 md:tw-text-black md:tw-pt-0 md:tw-pb-0">
            <span className="tw-block md:tw-hidden">Log in</span>
            <span className="tw-hidden md:tw-block">Log in to your account</span>
          </div>
          <div className="tw-flex tw-items-center tw-justify-center md:tw-pt-10">
            <button type="button" className="tw-flex tw-justify-center tw-rounded-[20px] tw-text-white tw-bg-[#445FEB] tw-border-0 tw-items-center tw-font-semibold tw-w-4/5 tw-text-2xl tw-py-6 md:tw-rounded-md md:tw-font-normal md:tw-w-80 md:tw-text-lg md:tw-py-3">
              Log in
            </button>
          </div>
          <div className="tw-text-md tw-text-gray-500 tw-border-t-4 tw-border-b-4 border-gray-400 tw-py-10 tw-text-xl tw-flex tw-items-center tw-justify-center md:tw-text-base">
            don't have an account yet?
            <button type="button" className="tw-font-bold tw-text-black tw-bg-white tw-border-0 tw-items-center">
              Sign Up
            </button>
          </div>
          <div className="tw-flex tw-items-center tw-justify-center">
            <button type="button" className="tw-flex tw-justify-center tw-rounded-[20px] tw-text-[#445FEB] tw-bg-white tw-border-[#445FEB] tw-border-4 tw-items-center tw-font-semibold tw-py-6 tw-w-4/5 tw-text-2xl md:tw-rounded-md md:tw-border-2 md:tw-font-normal md:tw-py-3 md:tw-w-80 md:tw-text-lg">
              Sign Up
            </button>
          </div>
          <div className="tw-flex tw-flex-col tw-pt-6 tw-pb-2 tw-text-xl tw-items-center tw-justify-center md:tw-text-base">
            Looking for an organization?
            <div className="tw-pt-2">
              <button type="button" className="tw-flex tw-justify-center tw-text-[#445FEB] tw-font-bold tw-bg-white tw-border-0 tw-items-center tw-text-xl md:tw-text-base">
                Click Here
              </button>
            </div>
          </div>
        </div>
      </div>
      <IntroText />

      <FocusingOnPeople />

      <EnsuringSecurity />

      <HomelessStats />

      <WhoWeAreServing />
    </div>
  );
}

export default Home;
