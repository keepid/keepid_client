import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import ReCAPTCHA from 'react-google-recaptcha';
import ForgotPasswordSVG from '../static/images/forgot-password.svg';
import getServerURL from '../serverOverride';
import { reCaptchaKey } from '../configVars';

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface State {
  username: string,
  buttonState: string
}

interface Props {
  alert: any
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
    const {
      username,
    } = this.state;
    if (username.trim() === '') {
      this.props.alert.show('Please enter a valid username or password');
      this.setState({ buttonState: '' });
    } else {
      fetch(`${getServerURL()}/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          responseJSON = JSON.parse(responseJSON);
          const {status} = responseJSON; 
          if (status === 'SUCCESS') {
            this.props.alert.show('A reset code has been sent to your email. Check your inbox.');
            this.setState({ buttonState: '' });
          } else if (responseJSON === 'USER_NOT_FOUND') {
            this.props.alert.show('Incorrect Username');
            this.setState({ buttonState: '' });
          } else {
            this.props.alert.show('Server Failure: Please Try Again');
            this.setState({ buttonState: '' });
          }
        }).catch((error) => {
          this.props.alert.show('Network Failure: Check Server Connection');
          this.setState({ buttonState: '' });
        });
    }
  }

  render() {
    const {
      username,
    } = this.state;
    return (
      <div>
        <Helmet>
          <title>Password Recovery</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container">
          <div className="row mt-5">
            <div className="col-4 mobile-hide">
              <div className="float-right w-100">
                <img alt="Password Recovery" className="w-75 pt-5 mt-5 float-right " src={ForgotPasswordSVG} />
              </div>
            </div>

            <div className="col-8">
              <form className="form-signin pt-5 ml-5">
                <h1 className="h3 mb-3 font-weight-normal">Forgot Your Password?</h1>
                <span className="text-muted">Enter your username to reset your password. Afterwards, check your email or contact your nonprofit to get your password recovery code.</span>
                <label htmlFor="username" className="w-100 mt-3 font-weight-bold">
                  Username
                  <input
                    type="text"
                    className="form-control form-purple mt-1"
                    id="username"
                    placeholder="username"
                    value={username}
                    onChange={this.handleChangeUsername}
                    required
                  />
                </label>

                <div className="row pt-3">
                  <div className="col-6">
                    <button type="submit" onClick={this.handlePasswordReset} className={`btn btn-success loginButtonBackground w-100 ld-ext-right ${this.state.buttonState}`}>
                      Submit
                      <div className="ld ld-ring ld-spin" />
                    </button>
                  </div>
                </div>

                <div className="row pl-3 pb-3">
                  <span className="text-muted recaptcha-login-text mt-4">
                    This page is protected by reCAPTCHA, and subject to the Google
                    {' '}
                    <a href="https://www.google.com/policies/privacy/">Privacy Policy </a>
                    and
                    {' '}
                    <a href="https://www.google.com/policies/terms/">Terms of service</a>
                    .
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        <ReCAPTCHA
          sitekey={reCaptchaKey}
          ref={recaptchaRef}
          size="invisible"
        />
      </div>
    );
  }
}

export default withAlert()(ForgotPassword);
