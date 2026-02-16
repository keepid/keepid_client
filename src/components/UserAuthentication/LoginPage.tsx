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

  handleChangeUsername = (event: any) => {
    this.setState({ username: event.target.value });
  };

  handleLogin = (): void => {
    this.setState({ buttonState: 'running' });
    const { logIn } = this.props;
    const { username, password, recaptchaPayload } = this.state;
    if (username.trim() === '' || password.trim() === '') {
      const { alert } = this.props;
      alert.show('Please enter your username or email and password');
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
          const { status, username: resolvedUsername, userRole, organization, firstName, lastName } =
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
            logIn(role(), resolvedUsername || username, organization, `${firstName} ${lastName}`);
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
        const { username, userRole, organization, fullName, googleLoginError } = responseObj;

        // Check for specific Google login errors from the server
        if (googleLoginError) {
          if (googleLoginError === 'USER_NOT_FOUND') {
            this.handleGoogleLoginError(
              'No Keep.id account is linked to this Google account. Please find an organization and sign up first.',
            );
          } else if (googleLoginError === 'AUTH_FAILURE') {
            this.handleGoogleLoginError(
              'Google authentication failed. Please try again or use your username and password.',
            );
          } else if (googleLoginError === 'INTERNAL_ERROR') {
            this.handleGoogleLoginError(
              'Unable to complete Google sign-in due to a server issue. Please try again later.',
            );
          } else {
            this.handleGoogleLoginError('Google sign-in failed. Please try again.');
          }
          return;
        }

        if (!username || !userRole || !organization || !fullName) {
          this.handleGoogleLoginError('Google sign-in failed: Could not retrieve your account information. Please try again.');
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
        alert.show('Network Error: Unable to reach the server. Please check your connection and try again.');
        this.setState({ buttonState: '' });
        this.resetRecaptcha();
      });
  };

  handleGoogleLoginError = async (msg) => {
    const { alert } = this.props;
    alert.show(msg);
    this.setState({ buttonState: '' });
    this.resetRecaptcha();
  };

  render() {
    const {
      username,
      password,
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
        <div className="tw-container tw-mx-auto tw-max-w-5xl tw-px-4">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-12 tw-py-12 lg:tw-py-20 tw-min-h-[70vh] tw-items-center">
            <div className="tw-hidden md:tw-flex tw-flex-col tw-items-center tw-justify-center">
              <img
                alt="Login graphic"
                className="tw-w-4/5 tw-max-w-md"
                src={LoginSVG}
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
                <h1 className="h3 mb-3 font-weight-normal">Sign in</h1>
                <GoogleLoginButton
                  handleGoogleLoginSuccess={this.handleGoogleLoginSuccess}
                  handleGoogleLoginError={this.handleGoogleLoginError}
                />
                <label htmlFor="username" className="w-100 font-weight-bold">
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
                <div className="pt-3">
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
                      className={`px-5 ld-ext-right ${buttonState}`}
                    >
                      Sign In
                      <div className="ld ld-ring ld-spin" />
                    </Button>
                  </div>
                </div>
                <div className="pb-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <span className="">Forgot your password?</span>
                  </Link>
                </div>
                <div className="pb-1">
                  <span className="pt-3">Don&apos;t have an account?</span>
                </div>
                <div className="">
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
                <div className="pb-1">
                  <span className="pt-3">
                    Are you a nonprofit organization?
                  </span>
                </div>
                <div className="">
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
