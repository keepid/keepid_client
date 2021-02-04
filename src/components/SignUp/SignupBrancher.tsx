import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

import BaseCard from '../../components/BaseComponents/BaseCard';
import Building from '../../static/images/building.svg';
import Profile from '../../static/images/profile-pic.svg';

class SignupBrancher extends Component<{}, {}, {}> {
  render() {
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
                  cardSize="large-vertical"
                  cardLink="/organization-signup"
                  cardTitle="Social Organization"
                  cardText="I am an organization that is looking to serve those experiencing homelessness."
                  imageSrc={Building}
                  imageAlt="building"
                  imageLoc="top"
                  imageSize="70%"
                  buttonText="Try for Free"
                />
              </div>
              <BaseCard
                cardSize="large-vertical"
                cardLink="/find-organizations"
                cardTitle="Individual"
                cardText="I am experiencing homelessness or require secure identification storage."
                imageSrc={Profile}
                imageAlt="profile"
                imageLoc="top"
                imageSize="70%"
                buttonText="Find Organizations Near Me"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignupBrancher;
