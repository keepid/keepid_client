import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import Role from '../../static/Role';
import { isValidUsername, isValidPassword } from '../../lib/Validations/Validations';

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
    if (isValidUsername(username)) {
      await new Promise((resolve) => this.setState({ usernameValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ usernameValidator: 'false' }, resolve));
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

  validateConfirmPassword = async (): Promise<void> => {
    const { confirmPassword } = this.props;
    // ( if confirmed password is valid here)
    if (confirmPassword === this.props.password) {
      await new Promise((resolve) => this.setState({ confirmPasswordValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ confirmPasswordValidator: 'false' }, resolve));
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

  handleStepComplete = async (e) => {
    await Promise.all([this.validateUsername(), this.validatePassword(), this.validateConfirmPassword()]);
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
                You will be the
                {' '}
                {this.props.role}
                {' '}
                of your organization. As the
                {' '}
                {this.props.role}
                ,
                {this.props.role === Role.Admin
                  ? (
                    <div>
                      you can set up accounts for
                      <br />
                      {' '}
                      other workers in the organization and for your clients.
                      {' '}
                    </div>
                  )
                  : <div>you can set up accounts for clients</div>}
              </span>
            </div>
            <form onSubmit={this.handleStepComplete}>
              <div className="form-group row">
                <label htmlFor="username" className="col-sm-3 col-form-label text-sm-right ">Username</label>
                <div className="col-sm-9">
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
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="password" className="col-sm-3 col-form-label text-sm-right">Password</label>
                <div className="col-sm-9">
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
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="confirmPassword" className="col-sm-3 col-form-label text-sm-right">Confirm Password</label>
                <div className="col-sm-9">
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
                </div>
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
