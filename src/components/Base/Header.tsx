import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import Logo from '../../static/images/logo.svg';
import getServerURL from '../../serverOverride';
import Role from '../../static/Role';

const logoSize = 40;
interface Props {
  logIn: (role: Role, username: string, organization: string, name: string) => void,
  logOut: () => void,
  isLoggedIn: boolean,
  role: Role,
  alert: any
}

interface State {}

class Header extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  handleLogout = (event: any) => {
    event.preventDefault();
    const {
      logOut,
    } = this.props;
    logOut();
  }

  render() {
    const {
      isLoggedIn,
      role,
    } = this.props;
    if (isLoggedIn) {
      return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-custom">
          <div className="container">
            <Link className="pr-3" to="/home">
              <img
                alt="Logo"
                src={Logo}
                width={logoSize}
                height={logoSize}
                className="d-inline-block"
              />
            </Link>
            <Link className="navbar-brand" to="/home">
              Keep.id
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggleLoggedIn" aria-controls="navbarToggleLoggedIn" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="navbar-collapse collapse w-100 order-3 dual-collapse2" id="navbarToggleLoggedIn">
              <ul className="navbar-nav ml-auto">
                {(role === Role.Admin || role === Role.Director)
                    && (
                    <li className="nav-item col-med-2 my-1 flex-fill mr-2">
                      <Link className="nav-link" to="/admin-panel">Admin Panel</Link>
                    </li>
                    )}
                <li className="nav-item col-med-2 my-1 flex-fill mr-2">
                  <Link className="nav-link" to="/settings">My Account Settings</Link>
                </li>
                {(role === Role.Admin || role === Role.Director)
                  && (
                  <li className="nav-item col-med-2 my-1 ml-2 flex-fill mr-2">
                    <Link className="nav-link" to="/my-organization">My Organization</Link>
                  </li>
                  )}
                <div className="my-1 flex-fill">
                  <button type="button" onClick={this.handleLogout} className="btn btn-primary btn-dark-custom">Log Out</button>
                </div>
              </ul>
            </div>
          </div>
        </nav>
      );
    }
    return (
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-custom">
        <div className="container">
          <Link className="pr-3" to="/home">
            <img
              alt="Logo"
              src={Logo}
              width={logoSize}
              height={logoSize}
              className="d-inline-block"
            />
          </Link>
          <Link className="navbar-brand" to="/home">
            Keep.id
          </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggle" aria-controls="navbarToggle" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarToggle">
            <ul className="navbar-nav mr-auto mt-2 mt-lg-0 ">
              {/* <li className="nav-item my-1 mr-2 ml-2">
                <Link className="nav-link" to="/">For Organizations</Link>
              </li> */}
            </ul>
            <ul className="navbar-nav ml-auto mt-2 mt-lg-0 ">
              <li className="nav-item my-1 mr-2 ml-2">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item my-1 mr-2 ml-2">
                <Link className="nav-link" to="/find-organizations">Find Organizations</Link>
              </li>
              <li className="nav-item my-1 mr-2 ml-2">
                <Link className="nav-link" to="/our-mission">About</Link>
              </li>
              <li className="nav-item my-1 mr-3 ml-2">
                <Link className="nav-link" to="/login">Log in</Link>
              </li>
            </ul>
            <div className="my-1">
              <Link to="/signup-branch">
                <button type="submit" className="btn btn-secondary w-40 mr-2">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default withAlert()(Header);
