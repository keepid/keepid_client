import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import HomepageGraphic from '../../static/images/homepage_graphic.svg';
import RectangleSVG from '../../static/images/rectangle.svg';
import Benefits from './Benefits';
import CoreValues from './CoreValues';
import FocusingOnPeople from './FocusingOnPeople';
import HowItWorks from './HowItWorks';
import IntroText from './IntroText';
import StatementOfSolidarity from './StatementOfSolidarity';

const messages = defineMessages({
  title: { id: 'home.title', defaultMessage: 'Welcome', description: 'Home welcome message' },
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
  learnMore: { id: 'home.learn-more', defaultMessage: 'Learn More' },
});

const Home = () => {
  const intl = useIntl();

  return (
    <div>
      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <StatementOfSolidarity />
      <div className="container-fluid my-auto">
        <div className="row section1 mt-5 justify-content-center">
          <div className="col-md-5 px-4 custom-vertical-center">
            <div className="rounded mb-3 pb-5">
              <div className="page-header">
                <span className="brand-text" id="brand-header">
                  {intl.formatMessage(messages.brandHeader)}
                </span>
              </div>
              <p className="pt-2 pb-2 home-subtext">{intl.formatMessage(messages.subHeader)}</p>
              <Link to="/signup-branch">
                <button type="button" className="btn btn-secondary btn-lg w-40 mr-2 mb-2">
                  {intl.formatMessage(messages.getStarted)}
                </button>
              </Link>
              <AnchorLink offset="100" href="#info">
                <button type="button" className="btn btn-outline-secondary btn-lg w-40 mr-2 mb-2">
                  {intl.formatMessage(messages.learnMore)}
                </button>
              </AnchorLink>
            </div>
          </div>
          <div className="col-md-5 px-5 custom-vertical-center">
            <div className="pb-4 container-home-right">
              <div>
                <img alt="Document Platform" src={HomepageGraphic} className="home-form-svg text-left" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <IntroText />

      <FocusingOnPeople />

      <HowItWorks />

      <CoreValues />

      <Benefits />
    </div>
  );
};

export default Home;
