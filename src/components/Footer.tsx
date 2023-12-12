import React from 'react';
import { Link } from 'react-router-dom';

import Email from '../static/images/email-2.svg';
import GithubLogo from '../static/images/github-logo.svg';
import InstagramLogo from '../static/images/instagram.svg';
import Logo from '../static/images/logo.svg';

function Footer() {
  return (
    <footer className="tw-bg-footerblack tw-px-16">
      <div className="tw-container tw-bg-footerblack tw-mx-auto ">
        <div className="tw-flex tw-flex-col tw-pt-8 lg:tw-pt-20 tw-pb-5 lg:tw-pb-10 tw-px-3 lg:tw-px-24">

            <div className="lg:tw-hidden tw-flex tw-flex-row tw-items-center tw-justify-center">
              <div>
                <img
                  alt="Keep.id Logo"
                  className="tw-h-10 tw-w-10"
                  src={Logo}
                />
              </div>
              <div className="tw-ml-2 tw-font-bold tw-text-white tw-text-xl">Keep.id</div>
            </div>

            <div className="tw-grid tw-grid-cols-3 tw-gap-3 lg:tw-flex lg:flex-row tw-py-8 tw-justify-between tw-items-start">
              <div>
                <a href="https://team.keep.id" className="tw-font-medium tw-text-white tw-text-base hover:tw-text-gray-500">
                  About Us
                </a>
              </div>
              <div>
                <Link to="/leave-feedback" className="tw-font-medium tw-text-white tw-text-base hover:tw-text-gray-500">
                  Contact Us
                </Link>
              </div>
              <div>
                <Link to="/privacy-policy" className="tw-font-medium tw-text-white tw-text-base hover:tw-text-gray-500">
                  Privacy
                </Link>
              </div>
              <div className="tw-hidden lg:tw-flex lg:tw-flex-row lg:tw-mx-6 lg:tw-items-center">
                <div>
                  <img
                    alt="Keep.id Logo"
                    className="tw-h-8 tw-w-8"
                    src={Logo}
                  />
                </div>
                <div className="tw-ml-2 tw-font-bold tw-text-white tw-text-xl">Keep.id</div>
              </div>
              <div>
                <Link to="/eula" className="tw-font-medium tw-text-white tw-text-base hover:tw-text-gray-500">
                  Legal
                </Link>
              </div>
              <div>
                <Link to="/issue-report" className="tw-font-medium tw-text-white tw-text-base hover:tw-text-gray-500">
                  Report Issue
                </Link>
              </div>
              <div>
                <Link to="/leave-feedback" className="tw-font-medium tw-text-white tw-text-base hover:tw-text-gray-500">
                  Leave Feedback
                </Link>
              </div>
            </div>
          <div className="tw-h-px tw-bg-white" />

          <div className="lg:tw-flex lg:tw-flex-row tw-pb-4 lg:tw-justify-between">
            <div>
              <p className="tw-text-white tw-pt-8">Sign up for our monthly email newsletter</p>
              <form>
                <div>
                  <label htmlFor="email-address" className="tw-sr-only">
                    Email address
                  </label>
                  <div className="tw-flex">
                    <div className="tw-relative tw-flex">
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="focus:tw-outline-none tw-border-3 tw-border-white tw-block tw-w-64 tw-bg-footerblack tw-rounded-l-md tw-py-2 tw-pl-10 tw-text-gray-900 tw-text-sm"
                        placeholder="Enter your email"
                      />
                      <button type="submit" className="tw-border-none stw--ml-1 tw-bg-white tw-items-center tw-gap-x-1.5 tw-rounded-r-md tw-px-3 tw-py-2 tw-text-sm tw-font-bold tw-text-gray-900 hover:tw-bg-gray-300">
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div>
              <p className="tw-text-white tw-pt-4 lg:tw-pt-8">Join our purpose-driven team</p>
              <div className="lg:tw-flex lg:tw-justify-end">
                <Link to="/careers">
                  <button type="button" className="tw-border-3 tw-border-white tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-bold tw-text-gray-900 tw-shadow-sm hover:tw-bg-gray-300">Careers at Keep.id</button>
                </Link>
              </div>
            </div>
          </div>

          <div className="tw-flex tw-justify-center tw-my-4 lg:tw-my-8">
            <a
              href="mailto:connorchong@keep.id"
              className="text-decoration-none"
            >
              <img
                alt="Email Address"
                src={Email}
                className="tw-h-8 tw-w-8 tw-filter tw-brightness-0 tw-invert"
              />
            </a>
            <a
              href="https://github.com/keepid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              <img
                alt="Github Link"
                src={GithubLogo}
                className="tw-h-8 tw-w-8 tw-mx-4 tw-filter tw-brightness-0 tw-invert"
              />
            </a>
            <a
              href="https://www.instagram.com/keepidphilly/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              <img
                src={InstagramLogo}
                className="tw-h-8 tw-w-8 tw-filter tw-brightness-0 tw-invert"
                alt="Instagram Link"
              />
            </a>
          </div>
          <p className="tw-text-xs tw-text-white tw-text-center my-0">Keep.id is proud to be a 501(c)(3) tax-exempt non-profit organization.</p>
          <p className="tw-text-xs tw-text-white tw-text-center my-1">Illustrations by Storyset.</p>
          <p className="tw-text-xs tw-text-white tw-text-center my-0">&copy; 2023 Keep.id</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
