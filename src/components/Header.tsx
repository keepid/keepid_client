import React, { Component, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';

import Logo from '../static/images/logo.svg';
import Role from '../static/Role';
import Logout from './UserAuthentication/Logout';

const logoSize = 40;

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
}

interface State {}

// We extend React.Component with Props & State
function Header({ logIn, logOut, isLoggedIn, role, alert }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Updated NavLink
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className="tw-block tw-py-2 tw-px-4
      tw-text-secondary-text-color
      hover:tw-text-white
      visited:tw-text-secondary-text-color
      focus:tw-text-white
      active:tw-text-white"
    >
      {children}
    </Link>
  );

  return (
    <nav className="tw-bg-primary-theme tw-w-full tw-sticky tw-top-0 tw-z-50">
      <div className="container tw-mx-auto tw-flex tw-items-center tw-justify-between tw-py-3">
        {/* Logo & Brand */}
        <div className="tw-flex tw-items-center">
          <Link to="/home" className="tw-pr-3">
            <img src={Logo} alt="Logo" width={logoSize} height={logoSize} />
          </Link>
          <Link
            to="/home"
            className="tw-text-white
          hover:tw-text-white
        visited:tw-text-white
        focus:tw-text-white
        active:tw-text-white
          tw-font-bold
          tw-text-4xl
          tw-mt-0
          tw-mb-0
          tw-pt-0
          tw-pb-0
          tw-font-raleway"
          >
            Keep.id
          </Link>
        </div>

        {/* Hamburger button */}
        <div className="sm:tw-hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="tw-bg-transparent tw-border tw-border-transparent tw-rounded tw-text-xl tw-leading-none tw-py-1 tw-px-3 tw-text-white"
            aria-label="Toggle navigation"
          >
            <svg
              className="tw-w-6 tw-h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop links */}
        <div className="tw-hidden sm:tw-flex sm:tw-items-center sm:tw-space-x-4">
          {isLoggedIn ? (
            <>
              <NavLink to="/">
                {role === Role.Admin || role === Role.Director || role === Role.Worker
                  ? 'My Clients'
                  : 'Home'}
              </NavLink>

              {(role === Role.Admin || role === Role.Director) && (
                <NavLink to="/admin-panel">Admin Panel</NavLink>
              )}
              <NavLink to="/settings">My Account Settings</NavLink>

              {(role === Role.Admin || role === Role.Director) && (
                <NavLink to="/my-organization">My Organization</NavLink>
              )}

              <div className="tw-py-2 tw-px-4">
                <Logout logOut={logOut} />
              </div>
            </>
          ) : (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/find-organizations">Find Organizations</NavLink>
              <a
                href="https://team.keep.id"
                className="tw-block tw-py-2 tw-px-4
                tw-text-secondary-text-color
                hover:tw-text-white
                visited:tw-text-secondary-text-color
                focus:tw-text-white
                active:tw-text-white"
              >
                About
              </a>

              <Link to="/login">
                <button className="btn btn-primary outline-white w-40 mr-2">
                  Log in
                </button>
              </Link>
              <Link to="/signup-branch">
                <button className="
                  tw-border
                  tw-border-secondary-theme
                  tw-text-secondary-theme
                  tw-no-underline
                  hover:tw-bg-secondary-theme
                  hover:tw-text-white
                  hover:tw-no-underline
                  tw-py-2
                  tw-px-4
                  tw-rounded
                  tw-mr-2"
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`sm:tw-hidden tw-bg-primary-color ${
          isOpen ? 'tw-block' : 'tw-hidden'
        }`}
      >
        <ul className="tw-list-none">
          {isLoggedIn ? (
            <>
              <li>
                <NavLink to="/">
                  {role === Role.Admin || role === Role.Director || role === Role.Worker
                    ? 'My Clients'
                    : 'Home'}
                </NavLink>
              </li>
              {(role === Role.Admin || role === Role.Director) && (
                <li>
                  <NavLink to="/admin-panel">Admin Panel</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/settings">My Account Settings</NavLink>
              </li>
              {(role === Role.Admin || role === Role.Director) && (
                <li>
                  <NavLink to="/my-organization">My Organization</NavLink>
                </li>
              )}
              <li className="tw-px-4 tw-py-2">
                <Logout logOut={logOut} />
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/find-organizations">Find Organizations</NavLink>
              </li>
              <li>
                <a
                  href="https://team.keep.id"
                  className="tw-block tw-py-2 tw-px-4 tw-text-secondary-text-color tw-hover:tw-text-white tw-visited:tw-text-white"
                >
                  About
                </a>
              </li>
              <li className="tw-px-4 tw-py-2">
                <Link to="/login">
                  <button className="btn btn-primary outline-white tw-w-full mr-2">
                    Log in
                  </button>
                </Link>
              </li>
              <li className="tw-px-4 tw-py-2">
                <Link to="/signup-branch">
                  <button className="
                    tw-border
                    tw-border-secondary-theme
                    tw-text-secondary-theme
                    tw-no-underline
                    hover:tw-bg-secondary-theme
                    hover:tw-text-white
                    hover:tw-no-underline
                    tw-w-full
                    tw-py-2
                    tw-rounded
                    tw-mr-2"
                  >
                    Sign Up
                  </button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default withAlert()(Header);
