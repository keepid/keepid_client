import classNames from 'classnames';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import BaseCard, {
  CardImageLoc,
  CardSize,
} from '../../components/BaseComponents/BaseCard';
import tinkPNG from '../../static/images/homePage/googletink.png';
import mozillaPNG from '../../static/images/homePage/mozilla_observatory.png';

const EnsuringSecurityMessages = defineMessages({
  header: {
    id: 'home.security.header',
    defaultMessage: 'Ensuring Security',
  },
  card1Header: {
    id: 'home.security.step-1-header',
    defaultMessage: 'Completely Secure',
  },
  card1Detail: {
    id: 'home.security.step-1-detail',
    defaultMessage: `Team Keep members are certified and follow "national standards for 
      electronic health care transactions and code sets, 
      unique health identifiers, and security."`,
  },
  card2Header: {
    id: 'home.security.step-2-header',
    defaultMessage: 'Always Encryped',
  },
  card2Detail: {
    id: 'home.security.step-2-detail',
    defaultMessage: `We use state-of-the-art security practices and 
    libraries used by industry leaders, such as Google. 
    Your documents are cryptographically signed and encrypted to increase client security.`,
  },
  card3Header: {
    id: 'home.security.step-3-header',
    defaultMessage: 'Secure in the Cloud',
  },
  card3Detail: {
    id: 'home.security.step-3-detail',
    defaultMessage: `Our application has been validated against internet vulnerabilities 
    by Mozilla Observatory. We hold ourselves to the highest web industry standards.`,
  },
  buttonLearnMore: {
    id: 'home.security.step-5-header',
    defaultMessage: 'Learn More',
  },
});

function EnsuringSecurity() {
  const intl = useIntl();
  return (
    <div className="py-5">
      <div className="w-100 partial-background">
        <div className="container">
          <h1 className="text-white pt-4 pb-4">
            {intl.formatMessage(EnsuringSecurityMessages.header)}
          </h1>
        </div>
      </div>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6">
            <BaseCard
              cardSize={CardSize.MEDIUM_VERTICAL}
              cardTitle={intl.formatMessage(
                EnsuringSecurityMessages.card2Header,
              )}
              cardText={intl.formatMessage(
                EnsuringSecurityMessages.card2Detail,
              )}
              imageSrc={tinkPNG}
              imageAlt="..."
              imageLoc={CardImageLoc.TOP}
              imageSize="50%"
              renderAdditionalContent={() => (
                <div>
                  <a
                    href="https://developers.google.com/tink"
                    className="card-link"
                  >
                    Learn More
                  </a>
                </div>
              )}
            />
          </div>
          <div className="col-md-6">
            <BaseCard
              cardSize={CardSize.MEDIUM_VERTICAL}
              cardTitle={intl.formatMessage(
                EnsuringSecurityMessages.card3Header,
              )}
              cardText={intl.formatMessage(
                EnsuringSecurityMessages.card3Detail,
              )}
              imageSrc={mozillaPNG}
              imageAlt="..."
              imageLoc={CardImageLoc.TOP}
              imageSize="50%"
              renderAdditionalContent={() => (
                <div>
                  <a
                    href="https://observatory.mozilla.org/analyze/keep.id"
                    className="card-link"
                  >
                    Learn More
                  </a>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnsuringSecurity;
