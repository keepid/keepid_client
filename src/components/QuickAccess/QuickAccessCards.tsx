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
    <Container>
      <h3>Quick Access</h3>
      <Row className="quick-access-card-container" md={{ cols: 21 }}>
        {quickAccessCards.map((c) => (
          <Col key={`quick-access-${c.id}`} className="quick-access-card">
            <Link to={`/quick-access/${c.id}`}>
              <div className="quick-access-card-body">
                <div className="quick-access-card-icon-container">
                  <Image className="quick-access-card-icon" src={c.svg} />
                </div>
                <h6 className="quick-access-card-title">
                  {intl.formatMessage(Messages[`quick-access.${c.id}.title`])}
                </h6>
              </div>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default QuickAccessCards;
