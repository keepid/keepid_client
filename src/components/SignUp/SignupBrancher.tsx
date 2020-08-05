import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
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
            <div className="row mt-3">
              <div className="col-md-9 mx-auto">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <Link to="/organization-signup" className="no-link-style">
                      <div className="card h-100 mx-4 mx-sm-0 branch-card">
                        <div className="embed-responsive embed-responsive-16by9 mt-2">
                          <img className="img-fluid rounded embed-responsive-item" src={Building} alt="building" />
                        </div>
                        <div className="card-body">
                          <h2 className="card-title font-weight-bold">Social Organization</h2>
                          <p className="card-text">I am an organization that is looking to serve those experiencing homelessness.</p>
                          <button className="btn btn-primary">Try for Free</button>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-6 mb-4">
                    <Link to="/find-organizations" className="no-link-style">
                      <div className="card h-100 mx-4 mx-sm-0 branch-card">
                        <div className="embed-responsive embed-responsive-16by9 mt-2">
                          <img className="img-fluid rounded embed-responsive-item" src={Profile} alt="profile" />
                        </div>
                        <div className="card-body">
                          <h2 className="card-title font-weight-bold">Individual</h2>
                          <p className="card-text">I am experiencing homelessness or require secure identification storage.</p>
                          <button className="btn btn-primary">Find Organizations Near Me</button>
                        </div>
                      </div>
                    </Link>
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

export default SignupBrancher;
