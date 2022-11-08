import React from 'react';
import { Link } from 'react-router-dom';

import Email from '../static/images/email-2.svg';
import GithubLogo from '../static/images/github-logo.svg';
import InstagramLogo from '../static/images/instagram.svg';
import Logo from '../static/images/logo.svg';

function Footer() {
  return (
    <footer className="footer custom-footer-color">
      <div className="container">
        <div className="d-flex flex-row bd-highlight py-8 py-md-11 flex-wrap">
          <div className="p-2 bd-highlight col-12 col-md-4 col-lg-4 mb-4">
            <div className="row">
              <img
                alt="Keep.id Logo"
                className="footer-brand img-fluid mb-2 ml-3"
                src={Logo}
              />
              <div className="mb-2 ml-3 footer-brand-logo">Keep.id</div>
            </div>
            <p className="text-gray-700 mb-2">
              Securely Combating Homelessness
            </p>
            <ul className="list-unstyled list-inline list-social">
              <li className="list-inline-item list-social-item mr-3">
                <a
                  href="mailto:connorchong@keep.id"
                  className="text-decoration-none"
                >
                  <img
                    alt="Email Address"
                    src={Email}
                    className="list-social-icon"
                  />
                </a>
              </li>
              <li className="list-inline-item list-social-item mr-3">
                <a
                  href="https://www.instagram.com/keepidphilly/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  <img
                    alt="Instagram Link"
                    src={InstagramLogo}
                    className="list-social-icon"
                  />
                </a>
              </li>
              <li className="list-inline-item list-social-item mr-3">
                <a
                  href="https://github.com/keepid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  <img
                    alt="Github Link"
                    src={GithubLogo}
                    className="list-social-icon"
                  />
                </a>
              </li>
            </ul>
            <ul className="list-unstyled list-inline list-social">
              <Link to="/issue-report" className="text-decoration-none">
                <span className="footer-link pb-1">Report an Issue</span>
              </Link>
            </ul>
            <ul className="list-unstyled list-inline list-social">
              <Link to="/leave-feedback" className="text-decoration-none">
                <span className="footer-link pb-1">Leave Feedback</span>
              </Link>
            </ul>
            <span className="text-muted pb-2">&copy; 2021 Keep.id</span>
          </div>
          <div className="p-2 bd-highlight col-12 col-md-4 col-lg-3 mb-4">
            <h6 className="font-weight-bold text-uppercase footer-text-header mb-3">
              About Us
            </h6>
            <ul className="list-unstyled text-muted mb-6 mb-md-8 mb-lg-0">
              {/* <li className="mb-3">
              <Link to="/our-team" className="footer-link">
                Our Team
              </Link>
            </li> */}
              <li className="mb-3">
                <a href="https://team.keep.id" className="footer-link">
                  Our Mission
                </a>
              </li>
              <li className="mb-3">
                <Link to="/careers" className="footer-link">
                  Join Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="p-2 bd-highlight col-12 col-md-4 col-lg-3">
            <h6 className="font-weight-bold text-uppercase footer-text-header mb-3">
              Legal
            </h6>
            <ul className="list-unstyled text-muted mb-6 mb-md-8 mb-lg-0">
              <li className="mb-3">
                <Link to="/eula" className="footer-link">
                  End User License Agreement
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/privacy-policy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
