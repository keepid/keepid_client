import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface State {}

const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container">
      <Helmet>
        <title>Careers- Join Us</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-3">Join Keep.id</h1>
        <p className="lead pt-3">
          The Mission of Team Keep.id is to
          <b> prioritize collaboration </b>
          with our respective stakeholders, be
          <b> purpose-led </b>
          in our technical and non-technical work, and
          <b> practice empathy </b>
          in our interactions with those with housing insecurity.
        </p>
        <a
          href="https://bit.ly/about-us-keepid"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary btn mr-3">
            About Us
          </button>
        </a>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Technical Roles</h1>
      </div>
      <div className="row">
        <a
          href="https://bit.ly/keepid-frontend-engineer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Frontend Engineer
          </button>
        </a>
        <a
          href="https://bit.ly/keepid-backend-engineer-li"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Backend Engineer
          </button>
        </a>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Nontechnical Roles</h1>
      </div>
      <div className="row">
        <a
          href="https://bit.ly/keepid-cfro"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Chief Fundraising Officer
          </button>
        </a>
        <a
          href="https://bit.ly/keepid-cmo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Chief Marketing Officer
          </button>
        </a>
        <a
          href="https://bit.ly/keepid-coo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Chief Operations Officer
          </button>
        </a>
        <a
          href="https://bit.ly/keepid-business-analyst"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Business Analyst
          </button>
        </a>
        <a
          href="https://bit.ly/keepid-human-resources"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn btn-primary mr-3 mb-3">
            Human Resources Administrator
          </button>
        </a>
      </div>
    </div>
  );
};

export default Careers;
