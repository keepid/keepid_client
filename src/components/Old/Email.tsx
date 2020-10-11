import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import EmailLogo from '../../static/images/email.svg';

class Email extends Component<{}, {}, {}> {
  render() {
    return (
      <div className="container-fluid">
        <Helmet>
          <title>Email</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-6">
            <img src={EmailLogo} className="float-right mt-2" alt="Email" />
          </div>
          <div className="col-md-6 mt-4">
            <h3 className="textPrintHeader">
              Send an Email
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 overflow-auto" id="emailTable">
            <form>
              <div className="form-group row">
                <label htmlFor="inputEmail" className="col-sm-2 col-form-label">
                  To:
                  <div className="col-sm-10">
                    <input type="email" className="form-control" id="inputEmail" placeholder="Email address" />
                  </div>
                </label>
              </div>
              <div className="form-group row">
                <label htmlFor="inputSubject" className="col-sm-2 col-form-label">
                  Subject:
                  <div className="col-sm-10">
                    <input type="text" className="form-control" id="inputSubject" placeholder="Subject" />
                  </div>
                </label>
              </div>
              <div className="form-group row">
                <label htmlFor="inputBody" className="col-sm-2 col-form-label">
                  Body:
                  <div className="col-sm-10">
                    <textarea className="form-control" id="inputBody" placeholder="Type your message here." />
                  </div>
                </label>
              </div>
              <button type="submit" className="btn btn-lg">
                Send
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }
}

export default Email;
