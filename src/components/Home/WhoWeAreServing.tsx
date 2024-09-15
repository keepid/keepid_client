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
      <div className="tw-w-full tw-pt-5 tw-pb-4 tw-overflow-hidden">
        <div className="tw-container tw-mx-auto">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-text-center">
            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-pb-4">
              <img
                alt="Why Not Prosper"
                src={WhyNotProsperPNG}
                className="tw-max-h-full tw-max-w-xs tw-object-contain tw-mx-auto tw-my-4"
              />
            </div>
            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-pb-4">
              <img
                alt="Face to Face"
                src={Face2Face}
                className="tw-max-h-full tw-max-w-xs tw-object-contain tw-mx-auto tw-my-4"
              />
            </div>
            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-pb-4">
              <img
                alt="Andree Collective"
                src={AdreeCollective}
                className="tw-max-h-full tw-max-w-xs tw-object-contain tw-mx-auto tw-my-4"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WhoWeAreServing;
