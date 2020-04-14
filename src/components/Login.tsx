import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import HubLogo from '../static/images/hubs.svg';
import DatabaseLogo from '../static/images/database.svg';
import AidPlatLogo from '../static/images/aidplatform.svg';

class Login extends Component<{}, {}, {}> {
  render() {
    return (
      <div className="container-fluid">
        <Helmet>
          <title>Login</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row mt-5">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-12" />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="background ml-5 p-4 rounded mb-3 pb-5">
                  <div className="page-header">
                    <span className="brand-text">
                      Breaking Barriers to Homelessness Services
                    </span>
                  </div>
                  <h2 className="mt-4 pt-2 pb-2">
                    <span>For Those Experiencing Homelessness</span>
                  </h2>
                  <p>
                    <span>Find a nearby registered organization that can help get you started.</span>
                  </p>
                  <a href="/find-organization" role="button" className="btn btn-primary btn-lg loginButtonBackground w-50">
                      Find Organizations
                  </a>
                  <h2 className="mt-4">
                    <span>For Organizations: Partner with Us</span>
                  </h2>
                  <p>
                    <span>Start your free three-month trial to empower clients you serve</span>
                  </p>
                  <a href="/organization-signup" role="button" className="btn btn-lg btn-primary loginButtonBackground w-50">
                    Start 3-Month Free Trial
                  </a>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mr-5 p-4 container-home-right">
                  <h1 className="text-center font-weight-bold">
                      Our Model
                  </h1>
                  <div className="row pb-4">
                    <div className="col-md-4">
                      <img alt="Hubs" src={HubLogo} className="home-svgs float-right" />
                    </div>
                    <div className="col-md-8 d-flex">
                      <span className="home-text">
  Local nonprofits against homelessness become
                        <b className="color-bold"> hubs </b>
  for Keep.id services
                      </span>
                    </div>
                  </div>
                  <div className="row pb-4">
                    <div className="col-md-4">
                      <img alt="Database" src={DatabaseLogo} className="home-svgs float-right" />
                    </div>
                    <div className="col-md-8 d-flex">
                      <span className="home-text">
  Keep.id
                        <b className="color-bold"> securely stores </b>
  documents and records for those experiencing homelessness
                      </span>
                    </div>
                  </div>
                  <div className="row pb-4">
                    <div className="col-md-4">
                      <img alt="Aid platform" src={AidPlatLogo} className="home-svgs float-right" />
                    </div>
                    <div className="col-md-8 d-flex">
                      <span className="home-text">
  Keep.id becomes an
                        <b className="color-bold"> aid platform </b>
  to streamline access to assistance programs and strengthen relationships between organizations and people
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
