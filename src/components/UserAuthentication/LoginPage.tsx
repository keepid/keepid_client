import React, { Component, useContext } from 'react';
import { withAlert } from 'react-alert';
import { Button } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { reCaptchaKey } from '../../configVars';
import getServerURL from '../../serverOverride';
import EyeIcon from '../../static/images/eye.svg';
import SlashEye from '../../static/images/eye-slash.svg';
import LoginSVG from '../../static/images/login-svg.svg';
import Role from '../../static/Role';
import GoogleLoginButton from './GoogleLoginButton';

interface State {
  username: string;
  password: string;
  buttonState: string;
  twoFactorState: string; // either empty or show
  verificationCode: string;
  userRole: string;
  firstName: string;
  lastName: string;
  organization: string;
  recaptchaPayload: string;
  showPassword: boolean;
}

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface Props {
  logIn: (
    role: Role,
    username: string,
    organization: string,
    name: string
  ) => void;
  logOut: () => void;
  isLoggedIn: boolean;
  role: Role;
  alert: any;
  autoLogout: boolean; // whether or not the user was logged out automatically
  setAutoLogout: (boolean) => void; // stop showing the logged out automatically banner once user navigates away from the page
}

class LoginPage extends Component<Props, State> {
  static enterKeyPressed(event, funct) {
    if (event.key === 'Enter') {
      funct();
    }
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      buttonState: '',
      twoFactorState: '',
      verificationCode: '',
      userRole: '',
      firstName: '',
      lastName: '',
      organization: '',
      recaptchaPayload: '',
      showPassword: false,
    };
  }

  componentWillUnmount() {
    const { setAutoLogout } = this.props;
    setAutoLogout(false);
  }

  // RECAPTCHA CODE
  onSubmitWithReCAPTCHA = async (e) => {
    e.preventDefault();
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      // @ts-ignore
      const recaptchaPayload = await recaptchaRef.current.executeAsync();
      this.setState({ recaptchaPayload }, this.handleLogin);
    }
  };

  resetRecaptcha = () => {
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      recaptchaRef.current.reset();
    }
    this.setState({ recaptchaPayload: '' });
  };
  // END RECAPTCHA CODE

  clearInput = async () => {
    this.setState({ username: '', password: '' });
  };

  togglePassword = () => {
    const { showPassword } = this.state;
    this.setState({ showPassword: !showPassword });
  };

  handleChangePassword = (event: any) => {
    this.setState({ password: event.target.value });
  };

  handleChangeVerificationCode = (event: any) => {
    this.setState({ verificationCode: event.target.value });
  };

  handleChangeUsername = (event: any) => {
    this.setState({ username: event.target.value });
  };

  handleSubmitTwoFactorCode = (event: any) => {
    event.preventDefault();
    const { verificationCode } = this.state;
    const token = verificationCode;
    const { username } = this.state;
    this.setState({ buttonState: 'running' });
    const { logIn } = this.props;
    fetch(`${getServerURL()}/two-factor`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
        token,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = responseJSON;
        const { status } = responseObject;
        const { userRole, organization, firstName, lastName } = this.state;
        if (status === 'AUTH_SUCCESS') {
          const role = () => {
            switch (userRole) {
              case 'Director':
                return Role.Director;
              case 'Admin':
                return Role.Admin;
              case 'Worker':
                return Role.Worker;
              case 'Client':
                return Role.Client;
              default:
                return Role.LoggedOut;
            }
          };
          logIn(role(), username, organization, firstName.concat(lastName));
        } else if (status === 'AUTH_FAILURE') {
          const { alert } = this.props;
          alert.show('Incorrect 2FA Token: Please Try Again');
          this.setState({ buttonState: '' });
        }
      })
      .catch(() => {
        const { alert } = this.props;
        alert.show('Network Failure: Check Server Connection. ');
        this.setState({ buttonState: '' });
      });
    this.resetRecaptcha();
  };

  handleLogin = (): void => {
    this.setState({ buttonState: 'running' });
    const { logIn } = this.props;
    const { username, password, recaptchaPayload } = this.state;
    if (username.trim() === '' || password.trim() === '') {
      const { alert } = this.props;
      alert.show('Please enter a valid username or password');
      this.clearInput();
      this.setState({ buttonState: '' });
      this.resetRecaptcha();
    } else {
      fetch(`${getServerURL()}/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          recaptchaPayload,
        }),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          const responseObject = responseJSON;
          const { status, userRole, organization, firstName, lastName } =
            responseObject;

          const { alert } = this.props;

          if (status === 'AUTH_SUCCESS') {
            const role = () => {
              switch (userRole) {
                case 'Director':
                  return Role.Director;
                case 'Admin':
                  return Role.Admin;
                case 'Worker':
                  return Role.Worker;
                case 'Client':
                  return Role.Client;
                case 'Developer':
                  return Role.Developer;
                default:
                  return Role.LoggedOut;
              }
            };
            logIn(role(), username, organization, `${firstName} ${lastName}`); // Change
          } else if (status === 'TOKEN_ISSUED') {
            this.setState({
              buttonState: '',
              twoFactorState: 'show',
              firstName,
              lastName,
              organization,
              userRole,
            });
          } else if (status === 'AUTH_FAILURE') {
            alert.show('Incorrect Username or Password');
            this.clearInput();
            this.setState({ buttonState: '' });
            this.resetRecaptcha();
          } else if (status === 'USER_NOT_FOUND') {
            alert.show('Incorrect Username or Password');
            this.clearInput();
            this.setState({ buttonState: '' });
            this.resetRecaptcha();
          } else {
            alert.show('Server Failure: Please Try Again');
            this.setState({ buttonState: '' });
            this.resetRecaptcha();
          }
        })
        .catch(() => {
          const { alert } = this.props;
          alert.show('Network Failure: Check Server Connection.');
          this.setState({ buttonState: '' });
          this.resetRecaptcha();
        });
    }
  };

  handleGoogleLoginSuccess = () => {
    fetch(`${getServerURL()}/get-session-user`, { method: 'GET', credentials: 'include' })
      .then((response) => response.json())
      .then((responseObj) => {
        const { username, userRole, organization, fullName } = responseObj;
        if (!username || !userRole || !organization || !fullName) {
          this.handleGoogleLoginError('Google Login Failed: Authentication Failure.');
          return;
        }
        const { logIn } = this.props;
        const role = () => {
          switch (userRole) {
            case 'Director':
              return Role.Director;
            case 'Admin':
              return Role.Admin;
            case 'Worker':
              return Role.Worker;
            case 'Client':
              return Role.Client;
            case 'Developer':
              return Role.Developer;
            default:
              return Role.LoggedOut;
          }
        };
        logIn(role(), username, organization, fullName);
      })
      .catch((_) => {
        const { alert } = this.props;
        alert.show('Network Error: Please Try Again.');
        this.setState({ buttonState: '' });
        this.resetRecaptcha();
      });
  }

  handleGoogleLoginError = async (msg) => {
    const { alert } = this.props;
    alert.show(msg);
    this.setState({ buttonState: '' });
    this.resetRecaptcha();
  }

  resubmitVerificationCode(event: any) {
    event.preventDefault();
    const { username, password } = this.state;
    const { alert } = this.props;
    alert.show('Another verification code has been sent to your email.');
    fetch(`${getServerURL()}/login`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  render() {
    const {
      username,
      password,
      verificationCode,
      twoFactorState,
      buttonState,
      showPassword,
    } = this.state;
    const { autoLogout } = this.props;
    return (
      <div>
        <Helmet>
          <title>Login</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        {autoLogout ? (
          <div className="alert alert-warning" role="alert">
            You were automatically logged out and redirected to this page.
          </div>
        ) : null}
        <div className="container">
          <div className="row tw-p-4 lg:tw-p-15">
            <div className="col tw-hidden md:tw-block">
              <div className="float-right w-100">
                <img
                  alt="Login graphic"
                  className="w-75 mt-2 mr-3 float-right "
                  src={LoginSVG}
                />
              </div>
              <div className="row pl-3 pb-3">
                <span className="text-muted recaptcha-login-text pt-4 mt-4 pl-5 ml-5 w-75">
                  This page is protected by reCAPTCHA, and subject to the Google
                  <a href="https://www.google.com/policies/privacy/">
                    Privacy Policy{' '}
                  </a>
                  and
                  <a href="https://www.google.com/policies/terms/">
                    Terms of service
                  </a>
                  .
                </span>
              </div>
            </div>

            <div className="col">
              <form className="form-signin pt-2">
                <h1 className="h3 mb-3 font-weight-normal">Sign in</h1>
                <GoogleLoginButton
                  handleGoogleLoginSuccess={this.handleGoogleLoginSuccess}
                  handleGoogleLoginError={this.handleGoogleLoginError}
                />
                <label htmlFor="username" className="w-100 font-weight-bold">
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
                <label
                  htmlFor="password"
                  className="w-100 pt-2 font-weight-bold"
                >
                  Password
                  <div className="pass-wrapper form-control form-purple mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="pass-input"
                      id="password"
                      placeholder="password"
                      value={password}
                      onChange={this.handleChangePassword}
                      required
                    />
                    <button
                      type="button"
                      className="pass-icon"
                      onClick={this.togglePassword}
                    >
                      <img
                        src={showPassword ? SlashEye : EyeIcon}
                        className="eye-size"
                        alt={showPassword ? 'Show' : 'Hide'}
                      />
                    </button>
                  </div>
                </label>
                {twoFactorState === 'show' ? (
                  <div className={`mt-3 mb-3 collapse ${twoFactorState}`}>
                    <div className="font-weight-normal mb-3">
                      A one-time verification code has been sent to your
                      associated email address. Please enter the code below.{' '}
                    </div>
                    <label
                      htmlFor="username"
                      className="w-100 font-weight-bold"
                    >
                      Verification Code
                      <input
                        type="text"
                        className="form-control form-purple mt-1"
                        id="verificationCode"
                        placeholder="Enter your verification code here"
                        value={verificationCode}
                        onChange={this.handleChangeVerificationCode}
                        required
                      />
                    </label>

                    <div className="row pt-3">
                      <div className="col-6 pl-0">
                        <button
                          type="submit"
                          onClick={this.resubmitVerificationCode}
                          className="mt-2 btn btn-danger w-100"
                        >
                          Resend Code
                        </button>
                      </div>
                      <div className="col-6 pl-0">
                        <Button
                          type="submit"
                          variant="primary"
                          onKeyDown={(e) =>
                            LoginPage.enterKeyPressed(
                              e,
                              this.handleSubmitTwoFactorCode,
                            )
                          }
                          onClick={this.handleSubmitTwoFactorCode}
                          className={`mt-2 w-100 ld-ext-right ${buttonState}`}
                        >
                          Sign In
                          <div className="ld ld-ring ld-spin" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div />
                )}
                <div className="row pt-3">
                  {twoFactorState !== 'show' ? (
                    <div className="pb-2">
                      <Button
                        type="submit"
                        onKeyDown={(e) =>
                          LoginPage.enterKeyPressed(
                            e,
                            this.onSubmitWithReCAPTCHA,
                          )
                        }
                        onClick={this.onSubmitWithReCAPTCHA}
                        variant="primary"
                        className={`px-5 w-100 ld-ext-right ${buttonState}`}
                      >
                        Sign In
                        <div className="ld ld-ring ld-spin" />
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
                <div className="row pb-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <span className="">Forgot your password?</span>
                  </Link>
                </div>
                <div className="row pb-1">
                  <span className="pt-3">Don&apos;t have an account?</span>
                </div>
                <div className="row">
                  <div className="col-10 pl-0">
                    <Link to="/find-organizations">
                      <button
                        type="button"
                        className="btn btn-outline-primary w-100 "
                      >
                        Find Organizations
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="row pb-1">
                  <span className="pt-3">
                    Are you a nonprofit organization?
                  </span>
                </div>
                <div className="row">
                  <div className="col-10 pl-0">
                    <Link to="/organization-signup">
                      <button
                        type="button"
                        className="btn btn-outline-primary w-100"
                      >
                        Sign Up with Us
                      </button>
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <ReCAPTCHA
          theme="dark"
          size="invisible"
          ref={recaptchaRef}
          sitekey={reCaptchaKey}
        />
      </div>
    );
  }
}

export default withAlert()(LoginPage);
