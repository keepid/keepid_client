import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Building from '../../static/images/building.svg';
import Profile from '../../static/images/profile-pic.svg';

const benefitsMessages = defineMessages({
  header: {
    id: 'home.benefits.header',
    defaultMessage: 'Benefiting both local non-profits and the homeless',
  },

  localHeader: {
    id: 'home.benefits.local.header',
    defaultMessage:
      'Local nonprofits achieve exponentially faster service times',
  },

  localDetail1: {
    id: 'home.benefits.local.detail-1',
    defaultMessage:
      'Stronger client relationships lead to greater touch points',
  },
  localDetail2: {
    id: 'home.benefits.local.detail-2',
    defaultMessage: 'Greater audience reach',
  },
  localDetail3: {
    id: 'home.benefits.local.detail-3',
    defaultMessage: 'Higher efficiency with paperwork',
  },

  homelessHeader: {
    id: 'home.benefits.homeless.header',
    defaultMessage: 'Homeless receive vital resources',
  },

  homelessDetail1: {
    id: 'home.benefits.homeless.detail-1',
    defaultMessage: 'Safe virtual document storage',
  },
  homelessDetail2: {
    id: 'home.benefits.homeless.detail-2',
    defaultMessage: 'Ease of applying for jobs and government aid',
  },
  homelessDetail3: {
    id: 'home.benefits.homeless.detail-3',
    defaultMessage: 'Control over personal data',
  },
});

function Benefits() {
  const intl = useIntl();

  return (
    <div className="row">
      <div className="container py-2 my-auto">
        <div className="row mt-4 mx-4 text-center d-flex justify-content-center">
          <h1 className="font-weight-bold">
            {intl.formatMessage(benefitsMessages.header)}
          </h1>
        </div>
      </div>
      <div className="container py-2 my-auto">
        <div className="row mt-4 mx-4 align-items-center">
          <div className="col-lg-5">
            <img
              className="img-fluid rounded mb-4 mb-lg-0"
              src={Building}
              alt="building"
            />
          </div>
          <div className="col-lg-7">
            <h3>{intl.formatMessage(benefitsMessages.localHeader)}</h3>
            <ul className="pl-4 mt-2">
              <li className="home-text">
                {intl.formatMessage(benefitsMessages.localDetail1)}
              </li>
              <li className="home-text">
                {intl.formatMessage(benefitsMessages.localDetail2)}
              </li>
              <li className="home-text">
                {intl.formatMessage(benefitsMessages.localDetail3)}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container py-2 my-auto">
        <div className="row mt-4 mx-4 align-items-center">
          <div className="col-lg-5 d-flex content-justify-center">
            <img
              className="img-fluid rounded mx-auto mb-4 "
              src={Profile}
              alt="profile pic"
            />
          </div>
          <div className="col-lg-7">
            <h3>{intl.formatMessage(benefitsMessages.homelessHeader)}</h3>
            <ul className="pl-4 mt-2">
              <li className="home-text">
                {intl.formatMessage(benefitsMessages.homelessDetail1)}
              </li>
              <li className="home-text">
                {intl.formatMessage(benefitsMessages.homelessDetail2)}
              </li>
              <li className="home-text">
                {intl.formatMessage(benefitsMessages.homelessDetail3)}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Benefits;
