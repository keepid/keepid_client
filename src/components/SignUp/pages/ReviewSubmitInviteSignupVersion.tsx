import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet';

import { reCaptchaKey } from '../../../configVars';
import Role from '../../../static/Role';

interface Props {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  birthDate: Date;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phonenumber: string;
  email: string;
  handleSubmit: () => void;
  handlePrevious: () => void;
  handleFormJumpTo: (stageNumber: number) => void;
  alert: any;
  buttonState: string;
  handleChangeRecaptcha: (recaptchaValue: string) => void;
  privilegeLevel: Role;
  orgName: string;
}

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface State {}

class ReviewSubmitInviteSignupVersion extends Component<Props, State, {}> {
  handleStepPrevious = (e) => {
    e.preventDefault();
    const { handlePrevious } = this.props;
    handlePrevious();
  };

  handleStepComplete = async (e) => {
    e.preventDefault();
  };

  onSubmitWithReCAPTCHA = async () => {
    const { handleChangeRecaptcha } = this.props;
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      // @ts-ignore
      const token = await recaptchaRef.current.executeAsync();
      handleChangeRecaptcha(token);
    }
  };

  passwordHider = (password: string) => '*'.repeat(password.length - 1);

  render() {
    const {
      username,
      password,
      firstname,
      lastname,
      birthDate,
      address,
      city,
      state,
      zipcode,
      phonenumber,
      email,
      handleFormJumpTo,
      buttonState,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>Sign Up- Organization Info</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <form>
          <div className="d-flex justify-content-center pt-5">
            <div className="col-md-10">
              <div className="text-center pb-4 mb-2">
                <h2>
                  <b>Verify all information is correct before submitting.</b>
                </h2>
              </div>
              <table className="table mb-4">
                <thead className="thead-light">
                  <tr>
                    <th className="w-25" scope="col">
                      Account Setup
                    </th>
                    <th
                      aria-label="Your Account Information"
                      className="w-75"
                      scope="col"
                    />
                    <th scope="col" onClick={() => handleFormJumpTo(0)}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-* shadow-none text-primary bg-transparent my-0 py-0"
                      >
                        Edit
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Username</th>
                    <td>{username}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Password</th>
                    <td>{this.passwordHider(password)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <table className="table mb-4">
                <thead className="thead-light">
                  <tr>
                    <th className="w-25" scope="col">
                      Personal Information
                    </th>
                    <th
                      aria-label="Your Personal Information"
                      className="w-75"
                      scope="col"
                    />
                    <th scope="col" onClick={() => handleFormJumpTo(1)}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-* shadow-none text-primary bg-transparent my-0 py-0"
                      >
                        Edit
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Name</th>
                    <td>
                      {firstname}

                      {lastname}
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Birthdate</th>
                    <td>{birthDate.toLocaleDateString('en-US')}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Mailing address</th>
                    <td>
                      {address}
                      {city}
,
{state}
                      {zipcode}
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Phone number</th>
                    <td>{phonenumber}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Email Address</th>
                    <td>{email}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <div className="mb-0">
                <span className="text-muted recaptcha-login-text">
                  This page is protected by reCAPTCHA, and subject to the Google
                  <a href="https://www.google.com/policies/privacy/">
                    Privacy Policy
{' '}
                  </a>
                  and
                  <a href="https://www.google.com/policies/terms/">
                    Terms of service
                  </a>
                  .
                </span>
              </div>
              <div className="d-flex">
                <button
                  type="button"
                  className="btn btn-outline-primary mt-5"
                  onClick={this.handleStepPrevious}
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={this.onSubmitWithReCAPTCHA}
                  className={`mt-5 ml-auto btn btn-primary ld-ext-right ${buttonState}`}
                >
                  Submit
                  <div className="ld ld-ring ld-spin" />
                </button>
                {/* <button type="button" className="ml-auto btn btn-primary mt-5" onClick={handleSubmit}>Submit</button> */}
              </div>
            </div>
          </div>
          <ReCAPTCHA
            theme="dark"
            size="invisible"
            ref={recaptchaRef}
            sitekey={reCaptchaKey}
          />
        </form>
      </div>
    );
  }
}

export default withAlert()(ReviewSubmitInviteSignupVersion);
