import React from 'react';
import { Helmet } from 'react-helmet';

import Building from '../../static/images/building.svg';
import Profile from '../../static/images/profile-pic.svg';
import BaseCard, { CardImageLoc, CardSize } from '../BaseComponents/BaseCard';

const clickedButton = () => {
  window.gtag('config', 'AW-391118279');
  window.gtag('event', 'conversion', { send_to: 'AW-391118279/baegCKfsltgDEMf7v7oB' });
};

function SignupBrancher() {
  return (
<div>
    <Helmet>
      <title>Signup Options</title>
      <meta name="description" content="Keep.id" />
    </Helmet>
    <div className="row">
      <div className="container py-2 my-auto">
        <div className="row mt-5 mx-4 text-center d-flex justify-content-center">
          <h1 className="font-weight-bold">Which option best describes you?</h1>
        </div>
        <div className="d-flex justify-content-center">
          <div className="mr-5">
            <BaseCard
              cardSize={CardSize.LARGE_VERTICAL}
              cardLink="/organization-signup"
              cardTitle="Social Organization"
              cardText="I am an organization that is looking to serve those experiencing homelessness."
              imageSrc={Building}
              imageAlt="building"
              imageLoc={CardImageLoc.TOP}
              imageSize="70%"
              buttonText="Try for Free"
              buttonOnClick={clickedButton}
            />
          </div>
          <BaseCard
            cardSize={CardSize.LARGE_VERTICAL}
            cardLink="/find-organizations"
            cardTitle="Individual"
            cardText="I am experiencing homelessness or require secure identification storage."
            imageSrc={Profile}
            imageAlt="profile"
            imageLoc={CardImageLoc.TOP}
            imageSize="70%"
            buttonText="Find Organizations Near Me"
          />
        </div>
      </div>
    </div>
</div>
  );
}

export default SignupBrancher;
