import React, { Component } from 'react';
import HubLogo from '../static/images/hubs.svg';
import DatabaseLogo from '../static/images/database.svg';
import AidPlatLogo from '../static/images/aidplatform.svg';

interface State {
	loggedIn: boolean,
}

class Login extends Component<{}, State, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      loggedIn: false, // Change to true in order to show landing logged in
    };
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row mt-5">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-12" />
            </div>
            <div className="row">
              <div className="background col-md-5 ml-5 pb-4">
                <div className="page-header textLoginLeftHeader">
                  <h1>
                    <span><b>Building a Safety Net around experienced homelessness in the Cloud</b></span>
                  </h1>
                </div>
                <h2 className="textLoginLeftSubHeader mt-5">
                  <span>Be Empowered</span>
                </h2>
                <p>
                  <span>Want to use our services? Find some nearby registered organizations that can help you get started.</span>
                </p>
                <button type="button" className="btn btn-primary btn-lg loginButtonBackground">
                    Get Started
                </button>
                <h2 className="textLoginLeftSubHeader mt-3">
                  <span>Partner with Us</span>
                </h2>
                <p>
                  <span>Are you an aid organization fighting to end homelessness?</span>
                </p>
                <a href="/organization-signup" role="button" className="btn btn-lg btn-primary loginButtonBackground">Join Our Cause</a>
              </div>
              <div className="col-md-1" />
              <div className="col-md-5">
                <h3 className="text-center textLoginRightHeader">
                    How Keep.id Works
                </h3>
                <div className="row">
                  <div className="col-md-4">
                    <img alt="Hubs" src={HubLogo} />
                  </div>
                  <div className="col-md-8">
                    <p className="textLoginRightPara">
                      <span>
1. Local organizations become
                        <b> hubs </b>
for Keep.id services
                      </span>
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <img alt="Database" src={DatabaseLogo} />
                  </div>
                  <div className="col-md-8">
                    <p className="textLoginRightPara">
                      <span>
2. Keep.id
                        <b> securely stores </b>
documents and records for those experiencing homelessness
                      </span>
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <img alt="Aid platform" src={AidPlatLogo} />
                  </div>
                  <div className="col-md-8">
                    <p className="textLoginRightPara">
                      <span>
3. Keep.id becomes an
                        <b> aid platform </b>
to streamline access to assistance programs and strengthen relationships between organizations and people
                      </span>
                    </p>
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
