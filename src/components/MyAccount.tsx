import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';

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
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">My Account</h5>
          <h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
          <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
          <a href="/home" className="card-link">Card link</a>
          <a href="/home" className="card-link">Another link</a>
          <form onSubmit={}>
            <div className="col-md-12">
              <div className="form-row">
                <div className="col-md-6 form-group">
                  <label htmlFor="inputOrgName">
                      Organization Name
                    <text className="red-star">*</text>
                    <input type="text" className="form-control form-purple" id="inputOrgName" placeholder="Keep" value={} onChange={} required />
                  </label>
                </div>
                <div className="col-md-6 form-group">
                  <label htmlFor="inputOrgWebsite">
                      Organization Website
                    <input type="url" readOnly={} className="form-control form-purple" id="inputOrgWebsite" placeholder="https://www.keep.id" value={} onChange={} />
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default MyAccount;
