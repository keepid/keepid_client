import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import RoxboroughPNG from '../../static/images/homePage/roxborough.png';
import VenturelabJPG from '../../static/images/homePage/venturelab.jpg';
import WhyNotProsperPNG from '../../static/images/homePage/whynotprosper.png';

const messages = defineMessages({
  header: {
    id: 'home.client-journey.header',
    defaultMessage: 'Our Partners',
  },
});

const WhoWeAreServing = (): JSX.Element => {
  const intl = useIntl();

  return (
    <>
      <div className="w-100 partial-background">
        <div className="container">
          <h1 className="text-white pt-4 pb-4">
            {intl.formatMessage(messages.header)}
          </h1>
        </div>
      </div>
      <div className="container-fluid mx-0 pt-5 pb-4">
        <div className="container section2">
          <div className="row text-center">
            <div className="col-md-4 p-4">
              <img
                alt="Why Not Prosper"
                src={WhyNotProsperPNG}
                className="home-form-svg text-left p-4"
              />
            </div>
            <div className="col-md-4">
              <img
                alt="Roxborough Food Pantry"
                src={RoxboroughPNG}
                className="home-form-svg text-left p-5"
              />
            </div>
            <div className="col-md-4">
              <img
                alt="Venturelab"
                src={VenturelabJPG}
                className="home-form-svg text-left"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhoWeAreServing;
