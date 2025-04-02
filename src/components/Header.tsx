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

  if (isLoggedIn) {
    return (
      <nav className="navbar navbar-dark sticky-top">
        <div className="container">
          {/* Logo and Brand */}
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

          {/* Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarToggleLoggedIn"
            aria-controls="navbarToggleLoggedIn"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Collapsible Section */}
          <div
            className="collapse navbar-collapse w-100 order-3"
            id="navbarToggleLoggedIn"
          >
            <ul className="navbar-nav ml-auto">
              <li className="nav-item mr-2 my-1">
                <Link className="nav-link" to="/">
                  {role === Role.Admin ||
                  role === Role.Director ||
                  role === Role.Worker
                    ? 'My Clients'
                    : 'Home'}
                </Link>
              </li>

              {(role === Role.Admin || role === Role.Director) && (
                <li className="nav-item mr-2 my-1">
                  <Link className="nav-link" to="/admin-panel">
                    Admin Panel
                  </Link>
                </li>
              )}

              <li className="nav-item mr-2 my-1">
                <Link className="nav-link" to="/settings">
                  My Account Settings
                </Link>
              </li>

              {(role === Role.Admin || role === Role.Director) && (
                <li className="nav-item mr-2 my-1">
                  <Link className="nav-link" to="/my-organization">
                    My Organization
                  </Link>
                </li>
              )}

              {/* Logout button in its own li */}
              <li className="nav-item my-1">
                <Logout logOut={logOut} />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  // If not logged in
  return (
    <nav className="tw-bg-gray-800 tw-text-white tw-w-full tw-sticky tw-top-0">
    {/* Main container: brand and hamburger */}
    <div className="tw-flex tw-items-center tw-justify-between tw-py-3 tw-px-4">
      {/* Left side: Logo + Brand */}
      <div className="tw-flex tw-items-center">
        <Link to="/home" className="tw-flex tw-items-center tw-pr-3">
          <img
            alt="Logo"
            src={Logo}
            width={logoSize}
            height={logoSize}
          />
        </Link>
        <Link to="/home" className="tw-text-xl tw-font-semibold">
          Keep.id
        </Link>
      </div>

      {/* Hamburger button (only visible on small screens) */}
      <div className="sm:tw-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="tw-text-white tw-outline-none tw-focus:outline-none"
        >
          <svg
            className="tw-w-6 tw-h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              // X (Close) icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger icon
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
    </div>

    {/* Collapsible menu: hidden on small screens unless isOpen is true */}
    <div
      className={`tw-bg-gray-800 sm:tw-flex sm:tw-items-center sm:tw-justify-end 
        ${isOpen ? 'tw-block' : 'tw-hidden'}`}
    >
      <ul className="sm:tw-flex sm:tw-space-x-4">
        <li className="tw-my-2 sm:tw-my-0">
          <Link to="/" className="tw-block tw-py-2 tw-px-4 hover:tw-bg-gray-700">
            Home
          </Link>
        </li>
        <li className="tw-my-2 sm:tw-my-0">
          <Link
            to="/find-organizations"
            className="tw-block tw-py-2 tw-px-4 hover:tw-bg-gray-700"
          >
            Find Organizations
          </Link>
        </li>
        <li className="tw-my-2 sm:tw-my-0">
          <a
            href="https://team.keep.id"
            className="tw-block tw-py-2 tw-px-4 hover:tw-bg-gray-700"
          >
            About
          </a>
        </li>
      </ul>

      <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-mb-2 sm:tw-mb-0 sm:tw-ml-4">
        <Link to="/login" className="tw-mb-2 sm:tw-mb-0 sm:tw-mr-2">
          <button
            type="button"
            className="tw-bg-blue-600 tw-text-white tw-py-2 tw-px-4 tw-rounded hover:tw-bg-blue-700"
          >
            Log in
          </button>
        </Link>
        <Link to="/signup-branch">
          <button
            type="button"
            className="tw-border tw-border-gray-300 tw-text-white tw-py-2 tw-px-4 tw-rounded hover:tw-bg-gray-700"
          >
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  </nav>
  );
}

export default withAlert()(Header);
