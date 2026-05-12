import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { Button } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { reCaptchaKey } from '../../configVars';
import getServerURL from '../../serverOverride';
import ForgotPasswordSVG from '../../static/images/forgot-password.svg';

interface State {
  newPassword: string;
  confirmPassword: string;
  buttonState: string;
  collapseState: string;
  recaptchaLoaded: boolean;
  recaptchaPayload: string;
  recaptchaExpired: boolean;
}

const reCaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface Props {
  alert: any;
  location: any;
}
class ResetPassword extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newPassword: '',
      confirmPassword: '',
      buttonState: '',
      collapseState: '',
      recaptchaLoaded: false,
      recaptchaPayload: '',
      recaptchaExpired: false,
    };
    this.handlePasswordJWTSubmit = this.handlePasswordJWTSubmit.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeConfirmPassword =
      this.handleChangeConfirmPassword.bind(this);
    this.handleRecaptchaChange = this.handleRecaptchaChange.bind(this);
  }

  handleChangePassword(event: any) {
    this.setState({ newPassword: event.target.value });
  }

  handleChangeConfirmPassword(event: any) {
    this.setState({ confirmPassword: event.target.value });
  }

  handlePasswordJWTSubmit(event: any) {
    if (reCaptchaRef && reCaptchaRef.current) {
      reCaptchaRef.current.execute();
    }
    this.setState({ buttonState: 'running' });
    event.preventDefault();
    const {
      newPassword,
      confirmPassword,
      recaptchaPayload,
      recaptchaLoaded,
      recaptchaExpired,
    } = this.state;
    const jwt = ResetPassword.getJWT();
    if (newPassword.trim() === '') {
      this.props.alert.show('Please enter a valid password');
      this.setState({ buttonState: '' });
    } else if (newPassword !== confirmPassword) {
      this.props.alert.show('Passwords do not match');
      this.setState({ buttonState: '' });
    } else if (!recaptchaLoaded || recaptchaExpired) {
      this.props.alert.show('Recaptcha has expired. Please refresh the page');
      this.setState({ buttonState: '' });
    } else {
      fetch(`${getServerURL()}/reset-password/`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          newPassword,
          jwt,
          recaptchaPayload,
        }),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          const { status } = responseJSON;
          if (status === 'SUCCESS') {
            this.props.alert.show('Successfully reset password');
            this.setState({ buttonState: '', collapseState: 'show' });
          } else if (status === 'USER_NOT_FOUND') {
            this.props.alert.show('Account not found');
            this.setState({ buttonState: '' });
          } else if (status === 'AUTH_FAILURE') {
            this.props.alert.show(
              'Your reset token has expired. Please try to reset your password again',
            );
            this.setState({ buttonState: '' });
          } else {
            this.props.alert.show('Server Failure: Please Try Again');
            this.setState({ buttonState: '' });
          }
        })
        .catch((error) => {
          this.props.alert.show('Network Failure: Check Server Connection');
          this.setState({ buttonState: '' });
        });
    }
  }

  static getJWT() {
    // fix this code later
    const splitParams = window.location.pathname.split('/');
    return splitParams[2];
  }

  // RECAPTCHA CODE
  componentDidMount() {
    this.setState({ recaptchaLoaded: true });
  }

  handleRecaptchaChange = (recaptchaPayload) => {
    this.setState({ recaptchaPayload });
    if (recaptchaPayload === null) this.setState({ recaptchaExpired: true });
  };
  // RECAPTCHA

  render() {
    const { newPassword, confirmPassword, recaptchaLoaded } = this.state;
    return (
      <div>
        <Helmet>
          <title>Password Recovery</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="tw-container tw-mx-auto tw-max-w-5xl tw-px-4">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-12 tw-py-12 lg:tw-py-20 tw-min-h-[70vh] tw-items-center">
            <div className="tw-hidden md:tw-flex tw-flex-col tw-items-center tw-justify-center">
              <img
                alt="Password Recovery"
                className="tw-w-4/5 tw-max-w-md"
                src={ForgotPasswordSVG}
              />
              <p className="tw-text-gray-500 tw-text-sm tw-mt-6 tw-text-center tw-max-w-sm">
                This page is protected by reCAPTCHA, and subject to the Google{' '}
                <a href="https://www.google.com/policies/privacy/">
                  Privacy Policy{' '}
                </a>
                and{' '}
                <a href="https://www.google.com/policies/terms/">
                  Terms of service
                </a>
                .
              </p>
            </div>

            <div className="tw-flex tw-justify-center">
              <form className="form-signin pt-2">
                <h1 className="h3 mb-3 font-weight-normal">
                  Enter Your New Password
                </h1>
                <span className="text-muted">Enter your new password.</span>
                <label
                  htmlFor="password"
                  className="w-100 mt-3 font-weight-bold"
                >
                  Password (at least 8 characters long)
                  <input
                    type="password"
                    className="form-control form-purple mt-1"
                    id="password"
                    placeholder="*******"
                    value={newPassword}
                    onChange={this.handleChangePassword}
                    required
                  />
                </label>

                <label
                  htmlFor="confirmPassword"
                  className="w-100 mt-3 font-weight-bold"
                >
                  Confirm Password
                  <input
                    type="password"
                    className="form-control form-purple mt-1"
                    id="confirmPassword"
                    placeholder="*******"
                    value={confirmPassword}
                    onChange={this.handleChangeConfirmPassword}
                    required
                  />
                </label>

                {this.state.collapseState !== 'show' ? (
                  <div className="pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      onClick={this.handlePasswordJWTSubmit}
                      className={`px-5 ld-ext-right ${this.state.buttonState}`}
                    >
                      Submit
                      <div className="ld ld-ring ld-spin" />
                    </Button>
                  </div>
                ) : (
                  <div />
                )}
                <div
                  className={`mt-3 mb-3 collapse ${this.state.collapseState}`}
                >
                  <div className="font-weight-normal mb-3">
                    You have successfully reset your password. Return to the
                    login page in order to log in with your new password.
                  </div>
                  <Link to="/login">
                    <Button
                      type="submit"
                      variant="primary"
                      className="mt-2 w-100"
                    >
                      Return to Login Page
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {recaptchaLoaded && (
          <ReCAPTCHA
            theme="dark"
            size="invisible"
            ref={reCaptchaRef}
            sitekey={reCaptchaKey}
            onChange={this.handleRecaptchaChange}
          />
        )}
      </div>
    );
  }
}

export default withAlert()(ResetPassword);
