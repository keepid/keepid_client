import React, { Component } from 'react';
import Logo from '../static/images/logo.svg';
import UsernameSVG from '../static/images/username.svg';
import PasswordSVG from '../static/images/password.svg';

interface Props {
  logIn: () => void,
  logOut: () => void,
  isLoggedIn: boolean
}

interface State {
  incorrectCredentials: boolean,
  username: string,
  password: string
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
    fetch('http://localhost:7000/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON === 'AUTH_SUCCESS') {
          logIn();
        } else if (responseJSON === 'AUTH_FAILURE') {
          alert('Incorrect Password');
          this.setState({ incorrectCredentials: true });
        } else if (responseJSON === 'USER_NOT_FOUND') {
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
              <a className="navbar-brand" href="/home">
                <img
                  alt="Logo"
                  src={Logo}
                  width="30"
                  height="30"
                  className="d-inline-block align-middle"
                />
              </a>
              <a className="navbar-brand" href="/home">
              keep.id
              </a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggleLoggedIn" aria-controls="navbarToggleLoggedIn" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
              </button>

              <div className="collapse navbar-collapse" id="navbarToggleLoggedIn">
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0" />
                <li className="nav-item">
                  <a className="nav-link" href="/myaccount">My Account</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/settings">Settings</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/myorganization">My Organization</a>
                </li>
                <div className="col-auto my-1">
                  <button type="submit" onClick={logOut} className="btn btn-primary">Log Out</button>
                </div>
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
            <a className="navbar-brand" href="/home">
              <img
                alt="Logo"
                src={Logo}
                width="30"
                height="30"
                className="d-inline-block align-middle"
              />
            </a>
            <a className="navbar-brand" href="/home">
              keep.id
            </a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggle" aria-controls="navbarToggle" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="navbarToggle">
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0" />
              <form>
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
