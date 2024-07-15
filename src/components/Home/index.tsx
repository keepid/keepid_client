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
      <div className="container-fluid my-auto">
        <div className="d-flex flex-row section1 mt-5 justify-content-center img-fluid">
          <div className="flex-col px-4 custom-vertical-center">
            <div className="rounded mb-3 pb-5">
              <div className="page-header">
                <span className="brand-text" id="brand-header">
                  {intl.formatMessage(messages.brandHeader)}
                </span>
              </div>
              <p className="pt-2 pb-2 home-subtext">
                {intl.formatMessage(messages.subHeader)}
              </p>
              <Link to="/signup-branch">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg w-40 mr-2 mb-2"
                >
                  {intl.formatMessage(messages.getStarted)}
                </button>
              </Link>
              <a
                href="https://team.keep.id"
                type="button"
                className="btn btn-outline-secondary btn-lg w-40 mr-2 mb-2"
              >
                {intl.formatMessage(messages.learnMore)}
              </a>
            </div>
          </div>
          <div className="flex-col px-5 custom-vertical-center">
            <div className="pb-4 container-home-right">
              <div>
                <img
                  alt="Document Platform"
                  src={HomepageGraphic}
                  className="home-form-svg text-left"
                />
              </div>
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
