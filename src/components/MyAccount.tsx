import React, { Component } from 'react';
import {Helmet} from "react-helmet";

interface State {
    show: boolean
}

class MyAccount extends Component<{}, State, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      show: false,
    };
  }

  // logic functions here

  render() {
    const {
      show,
    } = this.state;
    return (
      <div className="container">
        <Helmet>
          <title>My Account</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="card mt-2 mb-2">
          <div className="card-body">
            <h5 className="card-title pb-3">My Account Details</h5>

            <div className="row mb-3 mt-3">
              <div className="col card-text mt-2">
                My Name
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="inputOrgName" placeholder="John Smith" />
              </div>
              <div className="col card-text mt-2">
                Change
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col card-text mt-2">
                My Name
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="inputOrgName" placeholder="John Smith" />
              </div>
              <div className="col card-text mt-2">
                Change
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col card-text mt-2">
                My Name
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="inputOrgName" placeholder="John Smith" />
              </div>
              <div className="col card-text mt-2">
                Change
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyAccount;
