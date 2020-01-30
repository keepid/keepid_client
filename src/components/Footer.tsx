import React, { Component } from 'react';
import Logo from "../static/images/logo.svg"
import Email from "../static/images/email-2.svg"
import FacebookLogo from "../static/images/fb-logo.svg"
import GithubLogo from "../static/images/github-logo.svg"

interface Props {
}

interface State {
}

class Footer extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <footer className="footer custom-footer-color">
        <div className="container">
          <div className="d-flex flex-row bd-highlight py-8 py-md-11 flex-wrap">
            <div className="p-2 bd-highlight col-12 col-md-4 col-lg-4 mb-4">
              <div className="row">
                <img className="footer-brand img-fluid mb-2 ml-3" src={Logo}/>
                <div className="mb-2 ml-3 footer-brand-logo">Keep.id</div>
              </div>
              <p className="text-gray-700 mb-2">Securely Combating Homelessness</p>
              <ul className="list-unstyled list-inline list-social">
                <li className="list-inline-item list-social-item mr-3">
                  <a href="" className="text-decoration-none">
                    <img src={Email} className="list-social-icon"></img>
                  </a>
                </li>
                <li className="list-inline-item list-social-item mr-3">
                  <a href="" className="text-decoration-none">
                    <img src={FacebookLogo} className="list-social-icon"></img>
                  </a>
                </li>
                <li className="list-inline-item list-social-item mr-3">
                  <a href="https://github.com/crchong1/senior_design_2019" className="text-decoration-none">
                    <img src={GithubLogo} className="list-social-icon"></img>
                  </a>
                </li>
              </ul>
              <span className="text-muted pb-2">&copy;	2020 Keep.id</span>
            </div>
            <div className="p-2 bd-highlight col-12 col-md-4 col-lg-3 mb-4">
              <h6 className="font-weight-bold text-uppercase footer-text-header mb-3">About Us</h6>
              <ul className="list-unstyled text-muted mb-6 mb-md-8 mb-lg-0">
                <li className="mb-3">
                  <a href="/" className="footer-link">Our Team</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">Our Partners</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">Our Mission</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">Join Us</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link"></a>
                </li>
              </ul>
            </div>
            <div className="p-2 bd-highlight col-12 col-md-4 col-lg-3">
              <h6 className="font-weight-bold text-uppercase footer-text-header mb-3">Legal</h6>
              <ul className="list-unstyled text-muted mb-6 mb-md-8 mb-lg-0">
                <li className="mb-3">
                  <a href="/" className="footer-link">Organization Policies</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">Terms of Use</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">End User License Agreements</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">Privacy Policy</a>
                </li>
                <li className="mb-3">
                  <a href="/" className="footer-link">Copyright Policy</a>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </footer>
    );
  }
}

export default Footer;
