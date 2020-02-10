import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../static/images/logo.svg';
import UsernameSVG from '../static/images/username.svg';
import PasswordSVG from '../static/images/password.svg';
import getServerURL from '../serverOverride';
import Role from '../static/Role';

interface Props {
  logIn: (role: Role, username: string, organization: string, name: string) => void,
  logOut: () => void,
  isLoggedIn: boolean,
  role: Role,
}

interface State {
  incorrectCredentials: boolean,
  username: string,
  password: string,
}

class Header extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      incorrectCredentials: false,
      username: '',
      password: '', // Ensure proper length, combination of words and numbers (have a mapping for people to remember)
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  handleSubmit(event: any) {
    event.preventDefault();
    const {
      logIn,
    } = this.props;
    const {
      username,
      password,
    } = this.state;

    fetch(`${getServerURL()}/login`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          loginStatus,
          userRole,
        } = responseJSON;
        if (loginStatus === 'AUTH_SUCCESS') {
          const role = () => {switch(userRole) {
            case "admin": return Role.Admin;
            case "worker": return Role.Worker;
            case "client": return Role.Client;
            default: return Role.LoggedOut;
          }};
          logIn(role(), username, "Test Organization", "Test Name"); //Change
        } else if (loginStatus === 'AUTH_FAILURE') {
          alert('Incorrect Password');
          this.setState({ incorrectCredentials: true });
        } else if (loginStatus === 'USER_NOT_FOUND') {
          alert('Incorrect Username');
          this.setState({ incorrectCredentials: true });
        } else {
          alert('Server Failure: Please Try Again');
        }
      });
  }

  handleChangePassword(event: any) {
    this.setState({ password: event.target.value });
  }

  handleChangeUsername(event: any) {
    this.setState({ username: event.target.value });
  }

  render() {
    const {
      logOut,
      isLoggedIn,
      role,
    } = this.props;
    const {
      incorrectCredentials,
      username,
      password,
    } = this.state;

    const incorrectCredentialsText = incorrectCredentials ? <p color="red">Incorrect Credentials</p> : <div />;
    if (isLoggedIn) {
      return (
        <div>
          <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-custom">
            <div className="container">
              <Link className="navbar-brand" to="/home">
                <img
                  alt="Logo"
                  src={Logo}
                  width="30"
                  height="30"
                  className="d-inline-block align-middle"
                />
              </Link>
              <Link className="navbar-brand" to="/home">
                keep.id
              </Link>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggleLoggedIn" aria-controls="navbarToggleLoggedIn" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
              </button>
              <div className="navbar-collapse collapse w-100 order-3 dual-collapse2" id="navbarToggleLoggedIn">
                <ul className="navbar-nav ml-auto">
                  {(role === Role.Admin || role === Role.HeadAdmin)
                    && (
                    <li className="nav-item col-med-2 my-1 flex-fill mr-2">
                      <Link className="nav-link" to="/admin-panel">Admin Panel</Link>
                    </li>
                    )}
                  <li className="nav-item col-med-2 my-1 flex-fill mr-2">
                    <Link className="nav-link" to="/settings">My Account Settings</Link>
                  </li>
                  <li className="nav-item col-med-2 my-1 ml-2 flex-fill mr-2">
                    <Link className="nav-link" to="/my-organization">My Organization</Link>
                  </li>
                  <div className="col-auto my-1 flex-fill">
                    <button type="button" onClick={logOut} className="btn btn-primary">Log Out</button>
                  </div>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      );
    }
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-custom">
          <div className="container">
            <Link className="navbar-brand" to="/home">
              <img
                alt="Logo"
                src={Logo}
                width="30"
                height="30"
                className="d-inline-block align-middle"
              />
            </Link>
            <Link className="navbar-brand" to="/home">
              keep.id
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggle" aria-controls="navbarToggle" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="navbarToggle">
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0 " />
              <form onSubmit={this.handleSubmit}>
                <div className="form-row align-items-center">
                  <div className="col-med-2 my-1">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <img
                            alt="Username"
                            src={UsernameSVG}
                            width="22"
                            height="22"
                            className="d-inline-block align-middle"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="inlineFormInputGroupUsername"
                        onChange={this.handleChangeUsername}
                        value={username}
                        placeholder="Username"
                      />
                    </div>
                  </div>
                  <div className="col-med-2 my-1">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <img
                            alt="Password"
                            src={PasswordSVG}
                            width="22"
                            height="22"
                            className="d-inline-block align-middle"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="inlineFormInputGroupPassword"
                        onChange={this.handleChangePassword}
                        value={password}
                        placeholder="Password"
                      />
                    </div>
                  </div>
                  <div className="col-auto my-1">
                    <button type="submit" className="btn btn-primary">Login</button>
                  </div>
                </div>
              </form>
              {incorrectCredentialsText}
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Header;
