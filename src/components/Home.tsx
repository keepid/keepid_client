import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import HubLogo from '../static/images/hubs.svg';
import DatabaseLogo from '../static/images/database.svg';
import AidPlatLogo from '../static/images/aidplatform.svg';
import HomeForm from '../static/images/home-forms.svg';
import JobAppGraphic from '../static/images/job-app.svg';
import SecureGraphic from '../static/images/security.svg';
import ControlGraphic from '../static/images/control.svg';
import DocTransferGraphic from '../static/images/doc-transfer.svg';
import ConstantAvailabilityGraphic from '../static/images/constant-availability.svg';

interface Props {
  // autoLogout is true if the user automatically logged out and was redirect to this page
  autoLogout: boolean,
  resetAutoLogout: () => void,
}

class Home extends Component<Props, {}, {}> {
  componentWillUnmount() {
    const {
      resetAutoLogout,
    } = this.props;
    resetAutoLogout();
  }

  render() {
    const {
      autoLogout,
    } = this.props;

    return (
      <div className="">
        <Helmet>
          <title>Login</title>
          <meta name="description" content="Keep.id" />
        </Helmet>

        {autoLogout
          ? (
            <Alert variant="warning">
              You were automatically logged out and redirected to this page.
            </Alert>
          )
          : null}

        <div className="">
          <div className="">
            <div className="container-fluid">
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="background ml-5 p-4 rounded mb-3 pb-5">
                    <div className="page-header">
                      <span className="brand-text">
                        Safeguarding Identities of Those Experiencing Homelessness
                      </span>
                    </div>
                    <h4 className="pt-2 pb-2 brand-subtext">
                      A secure document storage platform for identification, reducing barriers in obtaining government aid, jobs, and homelessness services.
                    </h4>
                    <h2 className="mt-2 pt-2 pb-2">
                      <span className="home-subtext">For Those Experiencing Homelessness</span>
                    </h2>
                    <h5>Find a nearby registered organization that can help get you started</h5>
                    <Link to="/find-organization">
                      <button className="btn btn-primary btn-lg loginButtonBackground w-50">Find Organizations</button>
                    </Link>
                    <h2 className="mt-4">
                      <span className="home-subtext">For Organizations: Partner with Us</span>
                    </h2>
                    <h5>Start your free three-month trial to empower clients you serve</h5>
                    <Link to="/organization-signup">
                      <button className="btn btn-primary btn-lg loginButtonBackground w-50">Try Keep.id for Free</button>
                    </Link>
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
            </div>
            <div className="container mt-4 mb-4 pt-5 pb-5">
              <div className="row d-flex align-items-center">
                <div className="col-md-6 ">
                  <h1 className="text-center m-3 pb-5">
                    The lack of
                    {' '}
                    <span className="text-primary-theme font-weight-bold">identification</span>
                    {' '}
                    is a serious struggle for those experiencing homelessness.
                  </h1>
                </div>
                <div className="col-md-6">
                  <div className="row d-flex align-items-center">
                    <div className="col-6 text-center">
                      <h1 className="font-weight-bold statistic-text">54%</h1>
                    </div>
                    <div className="col-6">
                      <span className="statistic-subtext">Denied access to shelters or adequate housing services</span>
                    </div>
                  </div>
                  <div className="row d-flex align-items-center">
                    <div className="col-6 text-center">
                      <h1 className="font-weight-bold statistic-text">53%</h1>
                    </div>
                    <div className="col-6">
                      <span className="statistic-subtext">Denied access to food stamps</span>
                    </div>
                  </div>
                  <div className="row d-flex align-items-center">
                    <div className="col-6 text-center">
                      <h1 className="font-weight-bold statistic-text">45%</h1>
                    </div>
                    <div className="col-6">
                      <span className="statistic-subtext">Denied access to Medicaid or other medical services</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container-fluid mx-0 mt-4 mb-4 pt-5 pb-5 background">
              <div className="container">
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


            <div className="fluid-container mt-4 mb-4 pt-5 pb-5 mx-0 background">
              <div className="container">
                <div className="row">
                  {/* <div className="col-4 d-flex align-items-center">
                    <h1 className="font-weight-bold text-center">We understand the need for secure and convenient document access.</h1>
                  </div> */}
                  <div className="col">
                    <div className="row">
                      <div className="col text-center d-flex justify-content-center">
                        <h1 className="font-weight-bold">Our Core User Values:</h1>
                      </div>
                    </div>
                    <div className="row mt-4">
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <img alt="security" src={SecureGraphic} className="home-svgs" />
                      </div>
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <img alt="security" src={ConstantAvailabilityGraphic} className="home-svgs" />
                      </div>
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <img alt="security" src={DocTransferGraphic} className="home-svgs" />
                      </div>
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <img alt="security" src={ControlGraphic} className="home-svgs" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <h3 className="text-center"> Secure Access</h3>
                      </div>
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <h3 className="text-center"> Constant Availability</h3>
                      </div>
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <h3 className="text-center"> Protected Document Transfer</h3>
                      </div>
                      <div className="col-3 mt-4 d-flex align-items-center justify-content-center">
                        <h3 className="text-center"> Ease of Use</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container my-4 py-5">
              <div className="row">
                <div className="col-6">
                  <h1 className="font-weight-bold">Benefiting Both Local Non-Profits and the Homeless</h1>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-6">
                  <h3>Local nonprofits achieve exponentially faster service times</h3>
                  <ul className="pl-4 mt-2">
                    <li className="home-text">Stronger client relationships lead to greater touch profits</li>
                    <li className="home-text">Greater audience reach</li>
                    <li className="home-text">Higher efficiency with paperwork</li>
                  </ul>
                </div>
                <div className="col-6">
                  <h3>Homeless receive vital resources</h3>
                  <ul className="pl-4 mt-2">
                    <li className="home-text">Safe virtual document storage</li>
                    <li className="home-text">Ease of applying for jobs and government aid</li>
                    <li className="home-text">Control over personal data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
