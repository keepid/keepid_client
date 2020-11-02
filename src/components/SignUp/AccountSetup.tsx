import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import Role from '../../static/Role';
import { isValidUsername, isValidPassword } from '../../lib/Validations/Validations';
import getServerURL from '../../serverOverride';

interface Props {
  username: string,
  password: string,
  confirmPassword: string,
  onChangeUsername: () => void,
  onChangePassword: () => void,
  onChangeConfirmPassword: () => void,
  handleContinue: ()=> void,
  alert: any,
  role: Role
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

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  colorToggle = (inputString: string): string => {
    if (inputString === 'true') {
      return 'is-valid';
    } if (inputString === 'false') {
      return 'is-invalid';
    }
    return '';
  }

  validateUsername = async ():Promise<void> => {
    const { username } = this.props;
    // ( if username is valid here and if username is taken)
    const notTaken: boolean = await fetch(`${getServerURL()}/username-exists`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
        } = responseJSON;
        return (status === 'SUCCESS');
      });
    if (isValidUsername(username) && notTaken) {
      await new Promise((resolve) => this.setState({ usernameValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ usernameValidator: 'false' }, resolve));
    }
  }

  usernameMessage = (): ReactElement<{}> => {
    const { usernameValidator } = this.state;
    if (usernameValidator === 'true') {
      return (
        <div className="valid-feedback">
          This username is available.
        </div>
      );
    } if (usernameValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Invalid or taken username.
        </div>
      );
    }
    return (
      <div className="mb-2" />
    );
  }

  validatePassword = async (): Promise<void> => {
    const { password } = this.props;
    // ( if password is valid here)
    if (isValidPassword(password)) {
      await new Promise((resolve) => this.setState({ passwordValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ passwordValidator: 'false' }, resolve));
    }
  }

  passwordMessage = (): ReactElement<{}> => {
    const { passwordValidator } = this.state;
    if (passwordValidator === 'true') {
      return (
        <div className="valid-feedback">
          Password looks great!
        </div>
      );
    } if (passwordValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Password must be at least 8 characters long.
        </div>
      );
    }
    return (
      <small id="emailHelp" className="form-text text-muted">Password must be at least 8 characters long.</small>
    );
  }

  validateConfirmPassword = async (): Promise<void> => {
    const { confirmPassword, password } = this.props;
    // ( if confirmed password is valid here)
    if (confirmPassword === password) {
      await new Promise((resolve) => this.setState({ confirmPasswordValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ confirmPasswordValidator: 'false' }, resolve));
    }
  }

  confirmPasswordMessage = (): ReactElement<{}> => {
    const { confirmPasswordValidator } = this.state;
    if (confirmPasswordValidator === 'true') {
      return (
        <div className="valid-feedback">
          Passwords match.
        </div>
      );
    } if (confirmPasswordValidator === 'false') {
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

  returnAccountMessage = () => {
    const { role } = this.props;
    switch (role) {
      case Role.Admin: {
        return (
          <div>
            Admins can set up accounts for
            <br />
            {' '}
            other workers in the organization and for clients.
            {' '}
          </div>
        );
      }
      case Role.Director: case Role.Worker: case Role.Volunteer: {
        return (
          <div>
            {`${role}s`}
            can set up
            <br />
            {' '}
            accounts for clients.
            {' '}
          </div>
        );
      }
      default: {
        return <div />;
      }
    }
  }

  handleStepComplete = async (e) => {
    const {
      alert,
      handleContinue,
    } = this.props;
    const {
      usernameValidator,
      passwordValidator,
      confirmPasswordValidator,
    } = this.state;
    e.preventDefault();
    await Promise.all([this.validateUsername(), this.validatePassword(), this.validateConfirmPassword()]);
    if (usernameValidator === 'true'
        && passwordValidator === 'true'
        && confirmPasswordValidator === 'true') {
      handleContinue();
    } else {
      alert.show('One or more fields are invalid');
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
      role,
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
              <h2>
                <b>
                  First, set up the
                  {' '}
                  {role}
                  {' '}
                  account login.
                </b>
              </h2>
              <span>
                {this.returnAccountMessage()}
              </span>
            </div>
            <form onSubmit={this.handleStepComplete}>
              <div className="form-group row mt-3">
                <p className="col-sm-3 col-form-label text-sm-right ">Username</p>
                <label htmlFor="username" className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(usernameValidator)}`}
                    placeholder="Username"
                    id="username"
                    value={username}
                    onChange={onChangeUsername}
                    onBlur={this.validateUsername}

                  />
                  {this.usernameMessage()}
                </label>
              </div>
              <div className="form-group row">
                <p className="col-sm-3 col-form-label text-sm-right">Password</p>
                <label htmlFor="password" className="col-sm-9">
                  <input
                    type="password"
                    className={`form-control form-purple ${this.colorToggle(passwordValidator)}`}
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={onChangePassword}
                    onBlur={this.validatePassword}

                  />
                  {this.passwordMessage()}
                </label>
              </div>
              <div className="form-group row">
                <p className="col-sm-3 col-form-label text-sm-right">Confirm Password</p>
                <label htmlFor="confirmPassword" className="col-sm-9">
                  <input
                    type="password"
                    className={`form-control form-purple ${this.colorToggle(confirmPasswordValidator)}`}
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={onChangeConfirmPassword}
                    onBlur={this.validateConfirmPassword}

                  />
                  {this.confirmPasswordMessage()}
                </label>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary mt-5" onSubmit={this.handleStepComplete}>Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(AccountSetup);
