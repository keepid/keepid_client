import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import getServerURL from '../serverOverride';
import Role from '../static/Role';
import LoginSVG from '../static/images/login-svg.svg';
import { reCaptchaKey } from '../configVars';

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

interface State {
  username: string,
  password: string,
  buttonState: string,
  twoFactorState: string, // either empty or show
  verificationCode: string,
  userRole: string,
  firstName: string,
  lastName: string,
  organization: string
}

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
      lastName: '' ,
      organization: ''
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeVerificationCode = this.handleChangeVerificationCode.bind(this);
    this.handleSubmitTwoFactorCode = this.handleSubmitTwoFactorCode.bind(this);
    this.resubmitVerificationCode = this.resubmitVerificationCode.bind(this);
  }

  handleChangePassword(event: any) {
    this.setState({ password: event.target.value });
  }

  handleChangeVerificationCode(event: any) {
    this.setState({ verificationCode: event.target.value });

  }

  handleChangeUsername(event: any) {
    this.setState({ username: event.target.value });
  }

  handleSubmitTwoFactorCode(event: any) {
    event.preventDefault();

    let token = this.state.verificationCode;
    const {
      username,
      password,
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
        token
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        const returnMessage = responseJSON.message;
        const returnStatus = responseJSON.status;

        if (returnStatus === 'AUTH_SUCCESS') {
          const role = () => {
            switch (this.state.userRole) {
              case 'Admin': return Role.Admin;
              case 'Worker': return Role.Worker;
              case 'Client': return Role.Client;
              default: return Role.LoggedOut;
            }
          };
          logIn(role(), username, this.state.organization, this.state.firstName.concat(this.state.lastName));
        } else if (returnStatus === 'AUTH_FAILURE') {
          this.props.alert.show('Incorrect 2FA Token: Please Try Again');
          this.setState({ buttonState: '' });
        }
      }).catch((error) => {
        this.props.alert.show('Network Failure: Check Server Connection');
        this.setState({ buttonState: '' });
      });
  }

  handleLogin(event: any) {
    this.setState({ buttonState: 'running' });
    event.preventDefault();
    const {
      logIn,
    } = this.props;
    const {
      username,
      password,
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
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          responseJSON = JSON.parse(responseJSON);
          const loginStatus = responseJSON.loginStatus;
          const userRole = responseJSON.userRole;
          const organization = responseJSON.organization;
          const firstName = responseJSON.firstName;
          const lastName = responseJSON.lastName;

          if (loginStatus === 'AUTH_SUCCESS') {
            const role = () => {
              switch (userRole) {
                case 'Admin': return Role.Admin;
                case 'Worker': return Role.Worker;
                case 'Client': return Role.Client;
                default: return Role.LoggedOut;
              }
            };
            logIn(role(), username, organization, `${firstName} ${lastName}`); // Change
          } else if (loginStatus === 'TOKEN_ISSUED') {
            this.setState({ 
              buttonState: '', 
              twoFactorState: 'show',
              firstName: firstName,
              lastName: lastName,
              organization: organization,
              userRole: userRole
            });
          } else if (loginStatus === 'AUTH_FAILURE') {
            this.props.alert.show('Incorrect Username or Password');
            this.setState({ buttonState: '' });
          } else if (loginStatus === 'USER_NOT_FOUND') {
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
    let username = this.state.username;
    let password = this.state.password;
    fetch(`${getServerURL()}/login`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
      }),
    })
  }

  render() {
    const {
      username,
      password,
      verificationCode
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
                      <button type="submit" onClick={this.resubmitVerificationCode} className={`mt-2 btn btn-danger w-100`}>
                        Resend Code
                      </button>
                    </div>
                    <div className="col-6 pl-0">
                      <button type="submit" onClick={this.handleSubmitTwoFactorCode} className={`mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right ${this.state.buttonState}`}>
                        Sign In
                        <div className="ld ld-ring ld-spin" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="row pl-3 pt-3">
                  <div className="col-6 pl-0">
                    <div className="checkbox mb-3 pt-2">
                      <label>
                        <input type="checkbox" className="mr-1" value="remember-me" />
                        {' '}
Remember me
                      </label>
                    </div>
                  </div>
                  {(this.state.twoFactorState !== 'show') ?
                  <div className="col-6">
                    <button type="submit" onClick={this.handleLogin} className={`btn btn-success loginButtonBackground w-100 ld-ext-right ${this.state.buttonState}`}>
                        Sign In
                      <div className="ld ld-ring ld-spin" />
                    </button>
                  </div>
                  : <div></div> 
                  }
                </div>
                <div className="row pl-3 pb-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <span className="">Forgot your password?</span>
                  </Link>
                </div>
                <div className="row pl-3 pb-1">
                  <span className="pt-3">
                      Don't have an account?
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
          sitekey={reCaptchaKey}
          ref={recaptchaRef}
          size="invisible"
        />
      </div>
    );
  }
}

export default withAlert()(LoginPage);
