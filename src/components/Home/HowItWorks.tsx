import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AidPlatLogo from '../../static/images/aidplatform.svg';
import DatabaseLogo from '../../static/images/database.svg';
import HubLogo from '../../static/images/hubs.svg';

const howItWorksMessages = defineMessages({
  primaryText: {
    id: 'home.how-it-works.primary',
    defaultMessage:
      'We partner with aid organizations, leveraging existing resources and programming.',
  },
  nonProfitHeader: {
    id: 'home.how-it-works.non-profit.header',
    defaultMessage: 'Non-profit Focused',
  },
  nonProfitDetail: {
    id: 'home.how-it-works.non-profit.detail',
    defaultMessage:
      'Local nonprofits against homelessness become hubs for Keep.id services',
  },
  securityHeader: {
    id: 'home.how-it-works.security.header',
    defaultMessage: 'Security First',
  },
  securityDetail: {
    id: 'home.how-it-works.security.detail',
    defaultMessage:
      'Keep.id securely stores documents and records for those experiencing homelessness',
  },
  efficiencyHeader: {
    id: 'home.how-it-works.efficiency.header',
    defaultMessage: 'Efficient and Relational',
  },
  efficiencyDetail: {
    id: 'home.how-it-works.efficiency.detail',
    defaultMessage:
      'Keep.id becomes an aid platform to streamline access to assistance programs and strengthen relationships between organizations and people',
  },
});

function HowItWorks() {
  const intl = useIntl();

  return (
    <div className="container mt-5 mb-3">
      <div className="row">
        <div className="col-md-6 custom-vertical-center">
          <h1 className="text-center font-weight-bold m-3 pb-5">
            We partner with aid organizations, leveraging existing resources and
            programming.
          </h1>
        </div>
        <div className="col-md-6">
          <HowItWorksDetail
            header={intl.formatMessage(howItWorksMessages.nonProfitHeader)}
            detail={intl.formatMessage(howItWorksMessages.nonProfitDetail)}
            image={HubLogo}
          />
          <HowItWorksDetail
            header={intl.formatMessage(howItWorksMessages.securityHeader)}
            detail={intl.formatMessage(howItWorksMessages.securityDetail)}
            image={DatabaseLogo}
          />
          <HowItWorksDetail
            header={intl.formatMessage(howItWorksMessages.efficiencyHeader)}
            detail={intl.formatMessage(howItWorksMessages.efficiencyDetail)}
            image={AidPlatLogo}
          />
        </div>
      </div>
    </div>
  );
}

function HowItWorksDetail(props: {
  header: string;
  detail: string;
  image: string;
}) {
  return (
<div className="row pb-5">
    <div className="col-md-4 mb-2">
      <img alt="Hubs" src={props.image} className="home-svgs float-right" />
    </div>
    <div className="col-md-8 d-flex flex-column home-text">
      <h3>{props.header}</h3>
      <span>{props.detail}</span>
    </div>
</div>
  );
}

export default HowItWorks;
