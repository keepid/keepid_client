import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';

interface Props {
  username: string,
  onChangeUsername: () => void,
  password: string,
  onChangePassword: () => void,
  confirmPassword: string,
  onChangeConfirmPassword: () => void,
  handleContinue: ()=> void,
  alert: any
}

interface State {
  usernameValidator: string,
  passwordValidator: string,
  confirmPasswordValidator: string,
}

class AccountSetup extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      usernameValidator: '',
      passwordValidator: '',
      confirmPasswordValidator: '',
    };
  }

  colorToggle = (inputString: string): string => {
    if (inputString === 'true') {
      return 'is-valid';
    } if (inputString === 'false') {
      return 'is-invalid';
    }
    return '';
  }

  validateUsername = ():void => {
    const { username } = this.props;
    // ( if username is valid here and if username is taken)
    if (username) {
      this.setState({ usernameValidator: 'true' });
    } else {
      this.setState({ usernameValidator: 'false' });
    }
  }

  usernameMessage = (): ReactElement<{}> => {
    if (this.state.usernameValidator === 'true') {
      return (
        <div className="valid-feedback">
          This username is available.
        </div>
      );
    } if (this.state.usernameValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Invalid or taken username.
        </div>
      );
    }
    return (
      <div />
    );
  }

  validatePassword = ():void => {
    const { password } = this.props;
    // ( if password is valid here)
    if (password) {
      this.setState({ passwordValidator: 'true' });
    } else {
      this.setState({ passwordValidator: 'false' });
    }
  }

  passwordMessage = (): ReactElement<{}> => {
    if (this.state.passwordValidator === 'true') {
      return (
        <div className="valid-feedback">
          Password looks great!
        </div>
      );
    } if (this.state.passwordValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Password must be at least 8 characters long.
        </div>
      );
    }
    return (
      <small id="emailHelp" className="form-text text-muted mt-1">Password must be at least 8 characters long.</small>
    );
  }

  validateConfirmPassword = (): void => {
    const { confirmPassword } = this.props;
    // ( if confirmed password is valid here)
    if (confirmPassword === this.props.password) {
      this.setState({ confirmPasswordValidator: 'true' });
    } else {
      this.setState({ confirmPasswordValidator: 'false' });
    }
  }

  confirmPasswordMessage = (): ReactElement<{}> => {
    if (this.state.confirmPasswordValidator === 'true') {
      return (
        <div className="valid-feedback">
          Passwords match.
        </div>
      );
    } if (this.state.confirmPasswordValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Passwords do not match.
        </div>
      );
    }
    return (
      <div />
    );
  }

  handleStepComplete = (e) => {
    e.preventDefault();
    // check if all elements are valid
    if (this.state.usernameValidator === 'true'
      && this.state.passwordValidator === 'true'
      && this.state.confirmPasswordValidator === 'true') {
      this.props.handleContinue();
    } else {
      this.props.alert.show('One or more fields are invalid');
    }
  }

  render() {
    const {
      usernameValidator,
      passwordValidator,
      confirmPasswordValidator,
    } = this.state;
    const {
      username,
      password,
      confirmPassword,
      onChangeUsername,
      onChangePassword,
      onChangeConfirmPassword,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>
            Sign Up- Account Setup
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-8">
            <div className="text-center pb-4 mb-2">
              <h2><b>First, set up your account information</b></h2>
              <span>
                You will be the admin of your organization. As the admin, you can set up accounts for
                <br />
                {' '}
                other works in the organization and for your clients.
              </span>
            </div>
            <form>
              <div className="form-group row">
                <label htmlFor="username" className="col-sm-3 col-form-label text-right ">Username</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(usernameValidator)}`}
                    placeholder="Username"
                    id="username"
                    value={username}
                    onChange={onChangeUsername}
                    onBlur={this.validateUsername}
                    required
                  />
                  {this.usernameMessage()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="password" className="col-sm-3 col-form-label text-right">Password</label>
                <div className="col-sm-9">
                  <input
                    type="password"
                    className={`form-control form-purple ${this.colorToggle(passwordValidator)}`}
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={onChangePassword}
                    onBlur={this.validatePassword}
                    required
                  />
                  {this.passwordMessage()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="confirmPassword" className="col-sm-3 col-form-label text-right">Confirm Password</label>
                <div className="col-sm-9">
                  <input
                    type="password"
                    className={`form-control form-purple ${this.colorToggle(confirmPasswordValidator)}`}
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={onChangeConfirmPassword}
                    onBlur={this.validateConfirmPassword}
                    required
                  />
                  {this.confirmPasswordMessage()}
                </div>
              </div>
            </form>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-primary mt-5" onClick={this.handleStepComplete}>Continue</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(AccountSetup);
