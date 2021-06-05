/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import Access from '../static/images/access-data.svg';
import AidPlatLogo from '../static/images/aidplatform.svg';
import Building from '../static/images/building.svg';
import ConstantAvailabilityGraphic from '../static/images/constant-availability.svg';
import ControlGraphic from '../static/images/control.svg';
import DatabaseLogo from '../static/images/database.svg';
import DocTransferGraphic from '../static/images/doc-transfer.svg';
import FileCloud from '../static/images/file-cloud.svg';
import HomepageGraphic from '../static/images/homepage_graphic.svg';
import HubLogo from '../static/images/hubs.svg';
import Profile from '../static/images/profile-pic.svg';
import RectangleSVG from '../static/images/rectangle.svg';
import SecureGraphic from '../static/images/security.svg';
import SignUp from '../static/images/sign-up.svg';
import Spreadsheet from '../static/images/spreadsheet.svg';
import SyncFiles from '../static/images/sync-files.svg';

class Home extends Component<{}, {}, {}> {
  render() {
    return (
      <div>
        <Helmet>
          <title>Welcome</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container-fluid my-auto">
          <div className="row section1 mt-5 justify-content-center">
            <div className="col-md-5 px-4 custom-vertical-center">
              <div className="rounded mb-3 pb-5">
                <div className="page-header">
                  <span className="brand-text" id="brand-header">
                    An identification platform
                  </span>
                </div>
                <p className="pt-2 pb-2 home-subtext">
                  for those experiencing homelessness
                </p>
                <Link to="/signup-branch">
                  <button type="button" className="btn btn-primary btn-lg w-40 mr-2 mb-2">Learn More</button>
                </Link>
                <Link to="/signup-branch">
                  <button type="button" className="btn btn-outline-primary btn-lg w-40 mr-2 mb-2">Donate</button>
                </Link>
              </div>
            </div>
            <div className="col-md-5 px-5 custom-vertical-center">
              <div className="pb-4 container-home-right">
                <div>
                  <img alt="Hubs" src={HomepageGraphic} className="home-form-svg text-left" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-5">
          <div className="row viewport-height-50">
            <div className="col-md-10 custom-vertical-center mx-auto text-center">
              <div id="info">
                <img
                  className="svg-purple mb-5"
                  src={RectangleSVG}
                  alt="rectangle"
                />
                <h3 className="hero-subtext text-grey pb-3">
                  People experiencing homelessness need a platform to assist in applying for, securely storing, and utilizing ID to access services.
                </h3>
                <h3 className="hero-subtext text-black font-weight-medium pb-3">
                  Keep.id seeks to help by providing a guided application process integrated with non-profit networks and HIPAA-compliant ID storage, with low technological literacy needed.
                </h3>
                <AnchorLink offset="100" href="#info">
                  <button type="button" className="btn btn-outline-secondary btn-lg w-40">Learn More</button>
                </AnchorLink>
              </div>
            </div>
          </div>
        </div>
        <div className="w-100 partial-background">
          <div className="container">
            <h1 className="text-white pt-4 pb-4">Focusing on People</h1>
          </div>
        </div>
        <div className="container mt-4 mb-4 pt-5 pb-5">
          <div id="info" className="row d-flex align-items-center">
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
        <div className="bg-secondary">
          <div className="container">
            <div className="jumbotron jumbotron-fluid bg-transparent text-center pb-2 mb-2">
              <h1 className="display-5 text-light">Meaningful Client Journeys</h1>
              <p className="lead text-light">Prioritizing the user experience and alleviating pain points.</p>
            </div>
            <div id="carouselExampleCaptions" className="carousel slide" data-ride="carousel">
              <ol className="carousel-indicators">
                <li data-target="#carouselExampleCaptions" data-slide-to="0" className="active" />
                <li data-target="#carouselExampleCaptions" data-slide-to="1" />
                <li data-target="#carouselExampleCaptions" data-slide-to="2" />
                <li data-target="#carouselExampleCaptions" data-slide-to="3" />
                <li data-target="#carouselExampleCaptions" data-slide-to="4" />
              </ol>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src={SignUp} className="d-block w-100 mx-auto my-4 d-block home-svgs" alt="..." />
                  <h4 className="text-center text-white">Step #1: Registration</h4>
                  <p className="text-center text-light pb-5 w-50 mx-auto">Homeless create a Keep.id account at participating nonprofits. Nonprofits then help homeless obtain missing identification.</p>
                </div>
                <div className="carousel-item">
                  <img src={SyncFiles} className="d-block w-100 mx-auto my-4 d-block home-svgs" alt="..." />
                  <h4 className="text-center text-white">Step #2: Uploading</h4>
                  <p className="text-center text-light pb-5 w-50 mx-auto">Government identification, personal information, and prison health records are securely uploaded to our cloud databases. These documents are also cryptographically signed and encrypted.</p>
                </div>
                <div className="carousel-item">
                  <img src={Access} className="d-block w-100 mx-auto my-4 d-block home-svgs" alt="..." />
                  <h4 className="text-center text-white">Step #3: Access</h4>
                  <p className="text-center text-light pb-5 w-50 mx-auto">Those experiencing homelessness can access their documents at public or nonprofit computers.</p>
                </div>
                <div className="carousel-item">
                  <img src={FileCloud} className="d-block w-100 mx-auto my-4 d-block home-svgs" alt="..." />
                  <h4 className="text-center text-white">Step #4: Harnessing Data: Clients</h4>
                  <p className="text-center text-light pb-5 w-50 mx-auto">Those experiencing homelessness (we call them clients) can now use their data to apply for jobs, print their documents, and send autofilled aid applications.</p>
                </div>
                <div className="carousel-item">
                  <img src={Spreadsheet} className="d-block w-100 mx-auto my-4 d-block home-svgs" alt="..." />
                  <h4 className="text-center text-white">Step #5: Harnessing Data: Nonprofits</h4>
                  <p className="text-center text-light pb-5 w-50 mx-auto">Nonprofits can utilize data to generate reports, create additional touch points for care, and streamline their filing operations.</p>
                </div>
              </div>
              <a className="carousel-control-prev" href="#carouselExampleCaptions" role="button" data-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="sr-only">Previous</span>
              </a>
              <a className="carousel-control-next" href="#carouselExampleCaptions" role="button" data-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="sr-only">Next</span>
              </a>
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

        <div className="fluid-container mb-4 pt-5 pb-5 mx-0 background">
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
                  <div className="col-md-3 mt-4 text-center">
                    <img alt="security" src={SecureGraphic} className="home-svgs" />
                    <h4 className="text-center"> Secure Access</h4>
                  </div>
                  <div className="col-md-3 mt-4 text-center">
                    <img alt="security" src={ConstantAvailabilityGraphic} className="home-svgs" />
                    <h4 className="text-center"> Constant Availability</h4>
                  </div>
                  <div className="col-md-3 mt-4 text-center">
                    <img alt="security" src={DocTransferGraphic} className="home-svgs" />
                    <h4 className="text-center"> Protected Document Transfer</h4>
                  </div>
                  <div className="col-md-3 mt-4 text-center">
                    <img alt="security" src={ControlGraphic} className="home-svgs" />
                    <h4 className="text-center"> Ease of Use</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="container py-2 my-auto">
            <div className="row mt-4 mx-4 text-center d-flex justify-content-center">
              <h1 className="font-weight-bold">Benefiting both local non-profits and the homeless</h1>
            </div>
          </div>
          <div className="container py-2 my-auto">
            <div className="row mt-4 mx-4 align-items-center">
              <div className="col-lg-5">
                <img
                  className="img-fluid rounded mb-4 mb-lg-0"
                  src={Building}
                  alt="building"
                />
              </div>
              <div className="col-lg-7">
                <h3>Local nonprofits achieve exponentially faster service times</h3>
                <ul className="pl-4 mt-2">
                  <li className="home-text">Stronger client relationships lead to greater touch points</li>
                  <li className="home-text">Greater audience reach</li>
                  <li className="home-text">Higher efficiency with paperwork</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container py-2 my-auto">
            <div className="row mt-4 mx-4 align-items-center">
              <div className="col-lg-5 d-flex content-justify-center">
                <img
                  className="img-fluid rounded mx-auto mb-4 "
                  src={Profile}
                  alt="profile pic"
                />
              </div>
              <div className="col-lg-7">
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
    );
  }
}

export default Home;
