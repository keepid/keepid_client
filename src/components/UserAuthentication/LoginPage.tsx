import React, { useEffect, useRef, useState } from 'react';
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

const LoginPage = ({ logIn, logOut, isLoggedIn, role, alert, autoLogout, setAutoLogout }) => {
  const [state, setState] = useState({
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
  });

  const recaptcha = React.createRef();

  const handleInputChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const togglePassword = () => {
    setState({ ...state, showPassword: !state.showPassword });
  };

  const clearInput = () => {
    setState({ ...state, username: '', password: '' });
  };

  const enterKeyPressed = (event, callback) => {
    if (event.key === 'Enter') {
      callback();
    }
  };

  useEffect(() => () => {
    setAutoLogout(false);
  }, [setAutoLogout]);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setState({ ...state, recaptchaPayload: '' });
    }
  };

  const handleLogin = async () => {
    setState((prevState) => ({ ...prevState, buttonState: 'running' }));
    const { username, password, recaptchaPayload } = state;

    if (username.trim() === '' || password.trim() === '') {
      alert.show('Please enter a valid username or password');
      clearInput(); // Make sure clearInput is defined in your component
      resetRecaptcha(); // Make sure resetRecaptcha is defined in your component
      setState((prevState) => ({ ...prevState, buttonState: '' }));
    } else {
      try {
        const response = await fetch(`${getServerURL()}/login`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            username,
            password,
            recaptchaPayload,
          }),
        });

        const responseObject = await response.json();

        if (responseObject.status === 'AUTH_SUCCESS') {
          const role = () => {
            switch (responseObject.userRole) {
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
          logIn(role(), username, responseObject.organization, `${responseObject.firstName} ${responseObject.lastName}`);
          // UserContext.setUser({
          //   username: username,
          //   organization: responseObject.organization
          // });
        } else {
          // Handle other statuses: TOKEN_ISSUED, AUTH_FAILURE, USER_NOT_FOUND, etc.
          // Show alerts and reset state as needed
        }
      } catch (error) {
        alert.show('Network Failure: Check Server Connection.');
        setState((prevState) => ({ ...prevState, buttonState: '' }));
        resetRecaptcha();
      }
    }
  };

  const onSubmitWithReCAPTCHA = async (e) => {
    e.preventDefault();
    if (recaptchaRef.current) {
      try {
        const recaptchaPayload = await recaptchaRef.current.executeAsync();
        setState({ ...state, recaptchaPayload });
        handleLogin(); // Call handleLogin function here if required
      } catch (error) {
        // Handle any errors here
      }
    }
  };

  const handleSubmitTwoFactorCode = async (event) => {
    event.preventDefault();
    const { verificationCode, username, userRole, firstName, lastName, organization } = state;
    setState((prevState) => ({ ...prevState, buttonState: 'running' }));

    try {
      const response = await fetch(`${getServerURL()}/two-factor`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
          token: verificationCode,
        }),
      });

      const responseObject = await response.json();

      if (responseObject.status === 'AUTH_SUCCESS') {
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
        logIn(role(), username, organization, `${firstName} ${lastName}`);
      } else if (responseObject.status === 'AUTH_FAILURE') {
        alert.show('Incorrect 2FA Token: Please Try Again');
      } else {
        alert.show('Authentication failed. Please try again.');
      }
    } catch (error) {
      alert.show('Network Failure: Check Server Connection.');
    } finally {
      setState((prevState) => ({ ...prevState, buttonState: '' }));
      resetRecaptcha();
    }
  };

  const resubmitVerificationCode = async (event) => {
    event.preventDefault();
    const { username, password } = state;
    alert.show('Another verification code has been sent to your email.');

    try {
      await fetch(`${getServerURL()}/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      });
      // You might want to handle the response here
    } catch (error) {
      // Handle any errors that occur during fetch
    }
  };

  const { username, password, verificationCode, twoFactorState, buttonState, showPassword } = state;

  return (
        <div>
            <Helmet>
            <title>Login</title>
            <meta name="description" content="Keep.id" />
            </Helmet>
            {autoLogout && (
            <div className="alert alert-warning" role="alert">
                You were automatically logged out and redirected to this page.
            </div>
            )}
            <div className="container">
                <div className="row mt-4">
                <div className="col mobile-hide">
                <div className="float-right w-100">
                    <img
                      alt="Login graphic"
                      className="w-75 pt-5 mt-5 mr-3 float-right "
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
          <form className="form-signin pt-5">
            <h1 className="h3 mb-3 font-weight-normal">Sign in</h1>
            <label htmlFor="username" className="w-100 font-weight-bold">
              Username
              <input
                type="text"
                className="form-control form-purple mt-1"
                id="username"
                name="username"
                placeholder="username"
                value={state.username}
                onChange={handleInputChange} // Update the event handler
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
                      name="password"
                      placeholder="password"
                      value={state.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="pass-icon"
                      onClick={togglePassword}
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
                        onChange={handleInputChange}
                        required
                      />
                    </label>

                    <div className="row pt-3">
                      <div className="col-6 pl-0">
                        <button
                          type="submit"
                          onClick={resubmitVerificationCode}
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
                            enterKeyPressed(
                              e,
                              handleSubmitTwoFactorCode,
                            )
                          }
                          onClick={handleSubmitTwoFactorCode}
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
                          enterKeyPressed(
                            e,
                            onSubmitWithReCAPTCHA,
                          )
                        }
                        onClick={onSubmitWithReCAPTCHA}
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
                </div><div className="row pb-3">
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
};

export default withAlert()(LoginPage);
