import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import getServerURL from '../serverOverride';
import Role from '../static/Role';
import LoginSVG from '../static/images/login-svg.svg';
import { reCaptchaKey } from '../configVars';

interface State {
  username: string,
  password: string,
  buttonState: string,
  twoFactorState: string, // either empty or show
  verificationCode: string,
  userRole: string,
  firstName: string,
  lastName: string,
  organization: string,
  recaptchaPayload: string
}

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface Props {
  logIn: (role: Role, username: string, organization: string, name: string) => void,
  logOut: () => void,
  isLoggedIn: boolean,
  role: Role,
  alert: any
}

class LoginPage extends Component<Props, State> {
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
    };
  }

  // RECAPTCHA CODE
  onSubmitWithReCAPTCHA = async (e) => {
    e.preventDefault();
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      // @ts-ignore
      const recaptchaPayload = await recaptchaRef.current.gexecuteAsync();
      this.setState({ recaptchaPayload }, this.handleLogin);
    }
  }
  // END RECAPTCHA CODE

  handleChangePassword = (event: any) => {
    this.setState({ password: event.target.value });
  }

  handleChangeVerificationCode = (event: any) => {
    this.setState({ verificationCode: event.target.value });
  }

  handleChangeUsername = (event: any) => {
    this.setState({ username: event.target.value });
  }

  handleSubmitTwoFactorCode = (event: any) => {
    event.preventDefault();
    const token = this.state.verificationCode;
    const {
      username,
    } = this.state;
    this.setState({ buttonState: 'running' });
    const {
      logIn,
    } = this.props;
    fetch(`${getServerURL()}/two-factor`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
        token,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const { status } = responseObject;

        if (status === 'AUTH_SUCCESS') {
          const role = () => {
            switch (this.state.userRole) {
              case 'Director': return Role.Director;
              case 'Admin': return Role.Admin;
              case 'Worker': return Role.Worker;
              case 'Client': return Role.Client;
              default: return Role.LoggedOut;
            }
          };
          logIn(role(), username, this.state.organization, this.state.firstName.concat(this.state.lastName));
        } else if (status === 'AUTH_FAILURE') {
          this.props.alert.show('Incorrect 2FA Token: Please Try Again');
          this.setState({ buttonState: '' });
        }
      }).catch((error) => {
        this.props.alert.show('Network Failure: Check Server Connection.');
        this.setState({ buttonState: '' });
      });
  }

  handleLogin = (): void => {
    this.setState({ buttonState: 'running' });
    const {
      logIn,
    } = this.props;
    const {
      username,
      password,
      recaptchaPayload,
    } = this.state;
    if (username.trim() === '' || password.trim() === '') {
      this.props.alert.show('Please enter a valid username or password');
      this.setState({ buttonState: '' });
    } else {
      fetch(`${getServerURL()}/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          recaptchaPayload,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const responseObject = JSON.parse(responseJSON);
          const {
            status,
            userRole,
            organization,
            firstName,
            lastName,
          } = responseObject;

          if (status === 'AUTH_SUCCESS') {
            const role = () => {
              switch (userRole) {
                case 'Director': return Role.Director;
                case 'Admin': return Role.Admin;
                case 'Worker': return Role.Worker;
                case 'Client': return Role.Client;
                case 'Developer': return Role.Developer;
                default: return Role.LoggedOut;
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
            this.props.alert.show('Incorrect Username or Password');
            this.setState({ buttonState: '' });
          } else if (status === 'USER_NOT_FOUND') {
            this.props.alert.show('Incorrect Username or Password');
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

  resubmitVerificationCode(event: any) {
    event.preventDefault();
    const { username } = this.state;
    const { password } = this.state;
    this.props.alert.show('Another verification code has been sent to your email.');
    fetch(`${getServerURL()}/login`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  static enterKeyPressed(event, funct) {
    if (event.key === 'Enter') {
      funct();
    }
  }

  render() {
    const {
      username,
      password,
      verificationCode,
    } = this.state;
    return (
      <div>
        <Helmet>
          <title>Login</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container">
          <div className="row mt-4">
            <div className="col mobile-hide">
              <div className="float-right w-100">
                <img alt="Login graphic" className="w-75 pt-5 mt-5 mr-3 float-right " src={LoginSVG} />
              </div>
              <div className="row pl-3 pb-3">
                <span className="text-muted recaptcha-login-text pt-4 mt-4 pl-5 ml-5 w-75">
                  This page is protected by reCAPTCHA, and subject to the Google
                  {' '}
                  <a href="https://www.google.com/policies/privacy/">Privacy Policy </a>
                  and
                  {' '}
                  <a href="https://www.google.com/policies/terms/">Terms of service</a>
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
                    placeholder="username"
                    value={username}
                    onChange={this.handleChangeUsername}
                    required
                  />
                </label>
                <label htmlFor="password" className="w-100 pt-2 font-weight-bold">
                  Password
                  <input
                    type="password"
                    className="form-control form-purple mt-1"
                    id="password"
                    placeholder="password"
                    value={password}
                    onChange={this.handleChangePassword}
                    required
                  />
                </label>
                {(this.state.twoFactorState === 'show')
                  ? (
                    <div className={`mt-3 mb-3 collapse ${this.state.twoFactorState}`}>
                      <div className="font-weight-normal mb-3">A one-time verification code has been sent to your associated email address. Please enter the code below. </div>
                      <label htmlFor="username" className="w-100 font-weight-bold">
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

                      <div className="row pl-3 pt-3">
                        <div className="col-6 pl-0">
                          <button type="submit" onClick={this.resubmitVerificationCode} className="mt-2 btn btn-danger w-100">
                            Resend Code
                          </button>
                        </div>
                        <div className="col-6 pl-0">
                          <button type="submit" onKeyDown={(e) => LoginPage.enterKeyPressed(e, this.handleSubmitTwoFactorCode)} onClick={this.handleSubmitTwoFactorCode} className={`mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right ${this.state.buttonState}`}>
                            Sign In
                            <div className="ld ld-ring ld-spin" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                  : <div />}
                <div className="row pl-3 pt-3">
                  {(this.state.twoFactorState !== 'show')
                    ? (
                      <div className="pb-2">
                        <button
                          type="submit"
                          onKeyDown={(e) => LoginPage.enterKeyPressed(e, this.onSubmitWithReCAPTCHA)}
                          onClick={this.onSubmitWithReCAPTCHA}
                          className={`btn btn-success px-5 loginButtonBackground w-100 ld-ext-right ${this.state.buttonState}`}
                        >
                          Sign In
                          <div className="ld ld-ring ld-spin" />
                        </button>
                      </div>
                    )
                    : <div />}
                </div>
                <div className="row pl-3 pb-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <span className="">Forgot your password?</span>
                  </Link>
                </div>
                <div className="row pl-3 pb-1">
                  <span className="pt-3">
                    Don&apos;t have an account?
                  </span>
                </div>
                <div className="row pl-3">
                  <div className="col-10 pl-0">
                    <Link to="/find-organization">
                      <button type="button" className="btn btn-outline-primary w-100 ">Find Organizations</button>
                    </Link>
                  </div>
                </div>
                <div className="row pl-3 pb-1">
                  <span className="pt-3">
                    Are you a nonprofit organization?
                  </span>
                </div>
                <div className="row pl-3">
                  <div className="col-10 pl-0">
                    <Link to="/organization-signup">
                      <button type="button" className="btn btn-outline-primary w-100">Start 3-Month Free Trial</button>
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
