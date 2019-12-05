import React, { Component } from 'react';
import USStates from '../static/data/states_titlecase.json';
/*
import {
  Form, Button, Container, Row, Col,
} from 'react-bootstrap';
import querystring from 'querystring';
import https from 'https';

import NumWorkerOptions from '../static/data/num_worker_options.json';
import SignaturePad from '../react-typescript-signature-pad';
 */

// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface State {
  submitSuccessful: boolean,
  workerFirstName: string,
  workerLastName: string,
  workerEmail: string,
  workerPhoneNumber: string,
  workerAddressLine1: string,
  workerAddressCity: string,
  workerAddressState: string,
  workerAddressZipcode: string,
  workerPassword1: string,
  workerPassword2: string
}

class WorkerSignup extends Component<{}, State, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      submitSuccessful: false,
      workerFirstName: '',
      workerLastName: '',
      workerEmail: '',
      workerPhoneNumber: '',
      workerAddressLine1: '',
      workerAddressCity: '',
      workerAddressState: USStates[0].name,
      workerAddressZipcode: '',
      workerPassword1: '',
      workerPassword2: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeWorkerFirstName = this.handleChangeWorkerFirstName.bind(this);
    this.handleChangeWorkerLastName = this.handleChangeWorkerLastName.bind(this);
    this.handleChangeWorkerEmail = this.handleChangeWorkerEmail.bind(this);
    this.handleChangeWorkerPhoneNumber = this.handleChangeWorkerPhoneNumber.bind(this);
    this.handleChangeWorkerAddressLine1 = this.handleChangeWorkerAddressLine1.bind(this);
    this.handleChangeWorkerAddressCity = this.handleChangeWorkerAddressCity.bind(this);
    this.handleChangeWorkerAddressState = this.handleChangeWorkerAddressState.bind(this);
    this.handleChangeWorkerAddressZipcode = this.handleChangeWorkerAddressZipcode.bind(this);
    this.handleChangeWorkerPassword1 = this.handleChangeWorkerPassword1.bind(this);
    this.handleChangeWorkerPassword2 = this.handleChangeWorkerPassword2.bind(this);
  }

  handleSubmit(event: any) {
    event.preventDefault();
    if (this.state.workerPassword1 !== this.state.workerPassword2) {
      alert('Your passwords are not identical');
    } else {
      fetch('http://localhost:7000/worker-signup', {
        method: 'POST',
        body: JSON.stringify({
          firstname: this.state.workerFirstName,
          lastname: this.state.workerLastName,
          email: this.state.workerEmail,
          phonenumber: this.state.workerPhoneNumber,
          address: this.state.workerAddressLine1,
          city: this.state.workerAddressCity,
          state: this.state.workerAddressState,
          zipcode: this.state.workerAddressZipcode,
          password: this.state.workerPassword1,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          alert('Submitted request for new guest');
          this.setState({ submitSuccessful: true });
        });
    }
  }

  handleChangeWorkerFirstName(event: any) {
    console.log(event);
    this.setState({ workerFirstName: event.target.value });
  }

  handleChangeWorkerLastName(event: any) {
    this.setState({ workerLastName: event.target.value });
  }

  handleChangeWorkerEmail(event: any) {
    this.setState({ workerEmail: event.target.value });
  }

  handleChangeWorkerPhoneNumber(event: any) {
    this.setState({ workerPhoneNumber: event.target.value });
  }

  handleChangeWorkerAddressLine1(event: any) {
    this.setState({ workerAddressLine1: event.target.value });
  }

  handleChangeWorkerAddressCity(event: any) {
    this.setState({ workerAddressCity: event.target.value });
  }

  handleChangeWorkerAddressState(event: any) {
    this.setState({ workerAddressState: event.target.value });
  }

  handleChangeWorkerAddressZipcode(event: any) {
    this.setState({ workerAddressZipcode: event.target.value });
  }

  handleChangeWorkerPassword1(event: any) {
    this.setState({ workerPassword1: event.target.value });
  }

  handleChangeWorkerPassword2(event: any) {
    this.setState({ workerPassword2: event.target.value });
  }

  render() {
    // if (this.state.reaffirmStage) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 mt-5">
            <h3 className="text-center textPrintHeader">
                  Worker Signup Page
            </h3>
            <p className="textPrintDesc pl-3">
              <span>Thank you for using Keep.id to store your personal documents. Please fill out the following form to proceed with setting up your Keep.id account.</span>
            </p>
            <form onSubmit={this.handleSubmit}>
              <div className="col-md-12">
                <div className="form-row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="inputFirstName">
First Name
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="text"
                      className="form-control form-purple"
                      id="firstName"
                      onChange={this.handleChangeWorkerFirstName}
                      value={this.state.workerFirstName}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="inputLastName">
Last Name
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="text"
                      className="form-control form-purple"
                      id="lastName"
                      onChange={this.handleChangeWorkerLastName}
                      value={this.state.workerLastName}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-5 form-group">
                    <label htmlFor="inputPhone">
Contact Phone Number
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="tel"
                      className="form-control form-purple"
                      id="phoneNumber"
                      onChange={this.handleChangeWorkerPhoneNumber}
                      value={this.state.workerPhoneNumber}
                      placeholder="1-(234)-567-8901"
                      required
                    />
                  </div>
                  <div className="col-md-7 form-group">
                    <label htmlFor="inputEmail">
Contact Email Address
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="email"
                      className="form-control form-purple"
                      id="email"
                      onChange={this.handleChangeWorkerEmail}
                      value={this.state.workerEmail}
                      placeholder="contact@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputMailingAddress">
Worker Mailing Address
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="text"
                      className="form-control form-purple"
                      id="mailingAddress"
                      onChange={this.handleChangeWorkerAddressLine1}
                      value={this.state.workerAddressLine1}
                      placeholder="311 Broad St"
                      required
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputCity">
City
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="text"
                      className="form-control form-purple"
                      id="city"
                      onChange={this.handleChangeWorkerAddressCity}
                      value={this.state.workerAddressCity}
                      placeholder="Philadelphia"
                      required
                    />
                  </div>
                  <div className="col-md-2 form-group">
                    <label htmlFor="inputState">
State
                      <text className="red-star">*</text>
                    </label>
                    <select
                      className="form-control form-purple"
                      id="state"
                      value={this.state.workerAddressState}
                      onChange={this.handleChangeWorkerAddressState}
                      required
                    >
                      {USStates.map((USState) => (<option>{USState.name}</option>))}
                    </select>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputZipCode">
Zip Code
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="text"
                      className="form-control form-purple"
                      id="zipCode"
                      onChange={this.handleChangeWorkerAddressZipcode}
                      value={this.state.workerAddressZipcode}
                      placeholder="19104"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputPassword">
Password
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="password"
                      className="form-control form-purple"
                      id="password"
                      onChange={this.handleChangeWorkerPassword1}
                      value={this.state.workerPassword1}
                      placeholder="Password"
                      required
                    />
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputConfirmPassword">
Confirm Password
                      <text className="red-star">*</text>
                    </label>
                    <input
                      type="password"
                      className="form-control form-purple"
                      id="confirmPassword"
                      onChange={this.handleChangeWorkerPassword2}
                      value={this.state.workerPassword2}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                  <div className="col-auto mt-4 pt-2">
                    <button type="submit" className="btn btn-primary">Submit</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default WorkerSignup;
