import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import HomepageGraphic from '../../static/images/homepage_graphic.svg';
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
    defaultMessage: 'An Identification Platform',
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

  useEffect(() => {
    // Dynamically load the GTM script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-391118279';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize gtag only after the script has loaded
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'AW-391118279');

      // Now it's safe to call your conversion event
      gtag('event', 'conversion', { send_to: 'AW-391118279/baegCKfsltgDEMf7v7oB' });
    };
  }, []);

  return (
    <div>
      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      {/* <StatementOfSolidarity /> */}
      <div className="tw-container-fluid tw-my-auto">
        <div className="tw-flex tw-flex-col md:tw-flex-row mt-5 tw-justify-center tw-img-fluid">
          {/* Left Column */}
          <div className="tw-flex tw-flex-col tw-px-4 tw-items-center tw-justify-center">
            <div className="tw-rounded tw-mb-3 tw-pb-5">
              <div className="tw-text-center">
                <span className="brand-text" id="brand-header">
                  {intl.formatMessage(messages.brandHeader)}
                </span>
              </div>
              <p className="tw-pt-2 tw-pb-2 tw-text-center md:tw-text-left home-subtext">
                {intl.formatMessage(messages.subHeader)}
              </p>
              <div className="tw-text-center md:tw-text-left">
                <Link to="/signup-branch">
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg w-40 tw-mr-2 tw-mb-2 tw-py-2 tw-px-4 tw-rounded-lg"
                  >
                    {intl.formatMessage(messages.getStarted)}
                  </button>
                </Link>
                <a
                  href="https://team.keep.id"
                  type="button"
                  className="btn tw-outline btn-outline-secondary btn-lg tw-w-40 tw-mr-2 tw-mb-2 tw-py-2 tw-px-4"
                >
                  {intl.formatMessage(messages.learnMore)}
                </a>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="tw-flex tw-flex-col tw-items-center tw-px-5 tw-py-4 md:tw-py-0">
            <div className="tw-text-center tw-w-full">
              <img
                alt="Document Platform"
                src={HomepageGraphic}
                className="tw-w-full tw-overflow-hidden tw-min-w-[18.75rem] tw-max-w-[48.75rem] tw-ml-0 tw-pl-0 "
              />
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
