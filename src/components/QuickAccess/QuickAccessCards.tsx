import '../../static/styles/App.scss';

import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

// @ts-ignore
import BirthCertificateSvg from '../../static/images/QuickAccess/BirthCertificate.svg';
// @ts-ignore
import DriversLicenseSvg from '../../static/images/QuickAccess/DriversLicense.svg';
// @ts-ignore
import SocialSecurityCardSvg from '../../static/images/QuickAccess/SocialSecurityCard.svg';
// @ts-ignore
import VaccineCardSvg from '../../static/images/QuickAccess/VaccineCard.svg';
import Messages from './QuickAccess.messages';

const quickAccessCards = [
  {
    id: 'social-security',
    svg: SocialSecurityCardSvg,
  },
  { id: 'drivers-license', svg: DriversLicenseSvg },
  { id: 'birth-certificate', svg: BirthCertificateSvg },
  { id: 'vaccine-card', svg: VaccineCardSvg },
];

function QuickAccessCards(): React.ReactElement {
  const intl = useIntl();
  return (
    <div className="tw-mx-auto tw-py-4">
      <h3 className="tw-text-center lg:tw-text-left">Quick Access</h3>
      <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
        {quickAccessCards.map((c) => (
          <div key={`quick-access-${c.id}`} className="tw-p-4 tw-border tw-rounded-lg quick-access-card">
            <Link to={`/quick-access/${c.id}`}>
              <div className="tw-flex tw-flex-col tw-items-center">
                <div className="tw-mb-4">
                  <img className="tw-h-16 tw-w-16" src={c.svg} alt={c.title} />
                </div>
                <h6 className="tw-text-center">
                  {intl.formatMessage(Messages[`quick-access.${c.id}.title`])}
                </h6>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickAccessCards;
