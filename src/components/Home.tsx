import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import HomepageGraphic from '../static/images/venturelab_homepage_graphic.svg';

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
          <title>Welcome, Venture Lab!</title>
          <meta name="description" content="Keep.id" />
        </Helmet>

        {autoLogout
          ? (
            <div className="alert alert-warning" role="alert">
              You were automatically logged out and redirected to this page.
            </div>
          )
          : null}

        <div className="">
          <div className="">
            <div className="container-fluid my-auto">
              <div className="row mt-5 section1 align-items-center">
                <div className="col-md-6">
                  <div className="ml-5 p-4 rounded mb-3 pb-5">
                    <div className="page-header">
                      <span className="brand-text" id="brand-header">
                        Safeguarding your organization's documents
                      </span>
                    </div>
                    <p className="pt-2 pb-2 home-subtext">
                      A secure storage platform for Venture Lab's forms, contracts, and legal agreements, improving ease of document access and retrieval.
                    </p>
                    <Link to="/organization-signup">
                      <button type="button" className="btn btn-secondary btn-lg w-40 mr-2 mb-2">Get Started</button>
                    </Link>
                  </div>
                </div>
                <div className="col-md-6 custom-vertical-center">
                  <div className="mr-5 p-4 container-home-right">
                    <div>
                      <img alt="Hubs" src={HomepageGraphic} className="home-form-svg text-left" />
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

export default Home;
