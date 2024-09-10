import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AdreeCollective from '../../static/images/homePage/andreeCollective.png';
import Face2Face from '../../static/images/homePage/face2face.png';
import WhyNotProsperPNG from '../../static/images/homePage/whynotprosper.png';

const messages = defineMessages({
  header: {
    id: 'home.client-journey.header',
    defaultMessage: 'Our Partners',
  },
});

function WhoWeAreServing(): JSX.Element {
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
            <div className="col-md-4 mb-4 pb-4">
              <img
                alt="Why Not Prosper"
                src={WhyNotProsperPNG}
                className="home-form-svg text-left"
              />
            </div>
            <div className="col-md-4">
              <img
                alt="Face to Face"
                src={Face2Face}
                className="home-form-svg text-left my-4"
              />
            </div>
            <div className="col-md-4">
              <img
                alt="Andree Collective"
                src={AdreeCollective}
                className="home-form-svg text-left my-4"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WhoWeAreServing;
