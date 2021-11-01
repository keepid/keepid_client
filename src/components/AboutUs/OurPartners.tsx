import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import BaseCard, {
  CardImageLoc,
  CardSize,
} from '../../components/BaseComponents/BaseCard';
import BSMJPG from '../../static/images/bsm.jpg';

interface State {}

const OurPartners = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container">
      <Helmet>
        <title>Our Partners</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-4">Our Partners</h1>
        <p className="lead pt-3">
          The partner organizations of Keep.id who are working on the ground
          to maintain the safety and accessibility of your data.
        </p>
      </div>
      <div className="d-flex flex-wrap">
        <BaseCard
          cardSize={CardSize.LARGE_VERTICAL}
          cardTitle="Broad Street Ministries"
          cardText="We transform our city, our institutions,
          and ourselves when we embrace the individual needs of our most vulnerable sisters and brothers."
          imageSrc={BSMJPG}
          imageAlt="..."
          imageLoc={CardImageLoc.TOP}
          imageSize="50%"
          renderAdditionalContent={() => (
            <div>
              <a
                href="https://www.broadstreetministry.org/"
                className="card-link"
              >
                Website
              </a>
              <a
                href="https://www.facebook.com/BroadStreetMinistry/"
                className="card-link"
              >
                Facebook Page
              </a>
            </div>
          )}
        />
      </div>
    </div>
  );
};
export default OurPartners;
