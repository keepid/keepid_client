import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { defineMessages, useIntl } from 'react-intl';

import RectangleSVG from '../../static/images/rectangle.svg';

const messages = defineMessages({
  problemDescription: {
    id: 'home.hero-problem-description',
    defaultMessage:
      'People experiencing homelessness need a platform to assist in applying for, securely storing, and utilizing ID to access services.',
  },

  solutionDescription: {
    id: 'home.hero-solution-description',
    defaultMessage:
      'We provide a guided application process integrated with non-profit networks and secure ID storage, designed for those with low technological literacy.',
  },
});

function IntroText(): JSX.Element {
  const intl = useIntl();

  return (
    <div className="container py-5">
      <div className="row viewport-height-50">
        <div className="col-md-10 custom-vertical-center mx-auto text-center">
          <div id="info">
            <img
              className="svg-purple mb-5"
              src={RectangleSVG}
              alt="rectangle"
            />
            <h3 className="hero-subtext text-grey font-weight-light pb-3">
              {intl.formatMessage(messages.problemDescription)}
            </h3>
            <h3 className="hero-subtext text-black font-weight-medium pb-3">
              {intl.formatMessage(messages.solutionDescription)}
            </h3>
            <AnchorLink offset="100" href="#info">
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg w-40"
              >
                Learn More
              </button>
            </AnchorLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntroText;
