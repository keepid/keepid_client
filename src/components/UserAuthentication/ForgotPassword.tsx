import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { Button } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet';

import { reCaptchaKey } from '../../configVars';
import getServerURL from '../../serverOverride';
import ForgotPasswordSVG from '../../static/images/forgot-password.svg';

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface State {
  username: string;
  buttonState: string;
}

interface Props {
  alert: any;
}
class ForgotPassword extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      buttonState: '',
    };
    this.handlePasswordReset = this.handlePasswordReset.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
  }

  handleChangeUsername(event: any) {
    this.setState({ username: event.target.value });
  }

  handlePasswordReset(event: any) {
    this.setState({ buttonState: 'running' });
    event.preventDefault();
    const { username } = this.state;
    if (username.trim() === '') {
      this.props.alert.show('Please enter your username or email');
      this.setState({ buttonState: '' });
    } else {
      fetch(`${getServerURL()}/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
        }),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          const { status } = responseJSON;
          if (status === 'SUCCESS') {
            this.props.alert.show(
              'A reset code has been sent to your email. Check your inbox.',
            );
            this.setState({ buttonState: '' });
          } else if (status === 'USER_NOT_FOUND') {
            this.props.alert.show('Incorrect username or email');
            this.setState({ buttonState: '' });
          } else if (status === 'NOT_VALID_EMAIL') {
            this.props.alert.show(
              'There is no valid email address associated with this account. '
              + 'Please contact your nonprofit to get your password recovery code.',
            );
            this.setState({ buttonState: '' });
          } else if (status === 'UNABLE_TO_SEND') {
            this.props.alert.show(
              'Unable to send password reset email right now. Please try again later or contact support.',
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

  render() {
    const { username } = this.state;
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
                  Forgot Your Password?
                </h1>
                <span className="text-muted">
                  Enter your username or email to reset your password. Afterwards, check
                  your email or contact your nonprofit to get your password
                  recovery code.
                </span>
                <label
                  htmlFor="username"
                  className="w-100 mt-3 font-weight-bold"
                >
                  Username or email
                  <input
                    type="text"
                    className="form-control form-purple mt-1"
                    id="username"
                    placeholder="username or email"
                    value={username}
                    onChange={this.handleChangeUsername}
                    required
                  />
                </label>

                <div className="pt-3">
                  <Button
                    type="submit"
                    onClick={this.handlePasswordReset}
                    className={`px-5 ld-ext-right ${this.state.buttonState}`}
                    variant="primary"
                  >
                    Submit
                    <div className="ld ld-ring ld-spin" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <ReCAPTCHA sitekey={reCaptchaKey} ref={recaptchaRef} size="invisible" />
      </div>
    );
  }
}

export default withAlert()(ForgotPassword);
