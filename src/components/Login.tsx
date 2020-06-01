import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Helmet } from 'react-helmet';
import HubLogo from '../static/images/hubs.svg';
import DatabaseLogo from '../static/images/database.svg';
import AidPlatLogo from '../static/images/aidplatform.svg';
import HomeForm from '../static/images/home-forms.svg';

interface Props {
  // autoLogout is true if the user automatically logged out and was redirect to this page
  autoLogout: boolean,
  resetAutoLogout: () => void,
}

class Login extends Component<Props, {}, {}> {

  componentWillUnmount() {
    const {
      resetAutoLogout
    } = this.props;
    resetAutoLogout();
  }

  render() {

    const {
      autoLogout
    } = this.props;

    return (
      <div className="container-fluid">
        <Helmet>
          <title>Login</title>
          <meta name="description" content="Keep.id" />
        </Helmet>

        { autoLogout ? 
          <Alert variant="warning">
            You were automatically logged out and redirected to this page.
          </Alert> 
          : null }

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
                      Safeguarding Identities of Those Experiencing Homelessness
                    </span>
                  </div>
                  <h2 className="mt-4 pt-2 pb-2">
                    <span className="home-subtext">For Those Experiencing Homelessness</span>
                  </h2>
                  <p>
                    <span>Find a nearby registered organization that can help get you started</span>
                  </p>
                  <a href="/find-organization" role="button" className="btn btn-primary btn-lg loginButtonBackground w-50">
                      Find Organizations
                  </a>
                  <h2 className="mt-4">
                    <span className="home-subtext">For Organizations: Partner with Us</span>
                  </h2>
                  <p>
                    <span>Start your free three-month trial to empower clients you serve</span>
                  </p>
                  <a href="/organization-signup" role="button" className="btn btn-lg btn-primary loginButtonBackground w-50">
                    Start 3-Month Free Trial
                  </a>
                </div>
              </div>
              <div className="col-md-6 custom-vertical-center">
                <div className="mr-5 p-4 container-home-right">
                  <div>
                    <img alt="Hubs" src={HomeForm} className="home-form-svg text-left" />
                  </div>
                  
                </div>
              </div>
            </div>
            <div className="container mt-5 mb-3">
              <div className="row">
                <div className="col-md-6 custom-vertical-center">
                  <h1 className="text-center font-weight-bold m-3 pb-5">
                    We partner with aid organizations, leveraging existing resources and programming. 
                  </h1>
                </div>
                <div className="col-md-6">
                  <div className="row pb-5">
                    <div className="col-md-4 mb-2">
                      <img alt="Hubs" src={HubLogo} className="home-svgs float-right" />
                    </div>
                    <div className="col-md-8 d-flex flex-column home-text">
                      <h3>Non-profit Focused</h3>
                      <span>
    Local nonprofits against homelessness become hubs for Keep.id services
                      </span>
                    </div>
                  </div>
                  <div className="row pb-5">
                    <div className="col-md-4 mb-2">
                      <img alt="Database" src={DatabaseLogo} className="home-svgs float-right" />
                    </div>
                    <div className="col-md-8 d-flex flex-column home-text">
                      <h3>Security First</h3>
                      <span>
    Keep.id securely stores documents and records for those experiencing homelessness
                      </span>
                    </div>
                  </div>
                  <div className="row pb-5">
                    <div className="col-md-4 mb-2">
                      <img alt="Aid platform" src={AidPlatLogo} className="home-svgs float-right" />
                    </div>
                    <div className="col-md-8 d-flex flex-column home-text">
                      <h3>Efficient and Relational</h3>
                      <span className="home-text">
    Keep.id becomes an aid platform to streamline access to assistance programs and strengthen relationships between organizations and people
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container mt-4 mb-4 pt-5 pb-5 background">
              <div className="row text-center">
                <div className="col-md-4 flex-column ">
                  <h1 className="font-weight-bold statistic-text">552,830</h1>
                  <span className="statistic-subtext">Homeless Population in U.S.</span>
                  <p className="text-muted pt-2 pb-2"><a href="https://www.projecthome.org/about/facts-homelessness">Source</a></p>
                </div>
                <div className="col-md-4 flex-column">
                  <h1 className="font-weight-bold statistic-text">5,800</h1>
                  <span className="statistic-subtext">Chronically Homeless Population in Philadelphia</span>
                  <p className="text-muted pt-2 pb-2"><a href="https://www.projecthome.org/about/facts-homelessness">Source</a></p>
                </div>
                <div className="col-md-4 flex-column">
                  <h1 className="font-weight-bold statistic-text">6,583</h1>
                  <span className="statistic-subtext">Youth experiencing Homelessness in Philadelphia</span>
                  <p className="text-muted pt-2 pb-2"><a href="https://www.projecthome.org/about/facts-homelessness">Source</a></p>
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
