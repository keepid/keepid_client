import React from 'react';
import { Helmet } from 'react-helmet';

interface State {
}

class Careers extends React.Component<{}, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
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
            {' '}
            <b>prioritize collaboration</b>
            {' '}
            with our respective stakeholders,
            be
            {' '}
            <b>purpose-led</b>
            {' '}
            in our technical and non-technical work, and
            {' '}
            <b>practice empathy</b>
            {' '}
            in our interactions
            with those with housing insecurity.
          </p>
          <a href="https://bit.ly/keepid-about-us" target="_blank" rel="noopener noreferrer">
            <button type="button" className="btn btn-primary btn-lg mr-3">About Us</button>
          </a>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Technical Roles</h1>
        </div>
        <div className="row">
          <a href="https://bit.ly/keepid-software" target="_blank" rel="noopener noreferrer">
            <button type="button" className="btn btn-primary btn-lg mr-3">Software Engineer</button>
          </a>
          <a href="https://bit.ly/keepid-security" target="_blank" rel="noopener noreferrer">
            <button type="button" className="btn btn-primary btn-lg mr-3">Security Engineer</button>
          </a>
          <a href="https://bit.ly/keepid-designer" target="_blank" rel="noopener noreferrer">
            <button type="button" className="btn btn-primary btn-lg mr-3">UI/UX Designer</button>
          </a>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Nontechnical Roles</h1>
        </div>
        <div className="row">
          <a
            href="https://docs.google.com/document/d/1a84MRuc958CCsapjwbGlJcWYpyGWG_uvRpC9fROsFWg/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="btn btn-primary btn-lg mr-3">Business Analyst</button>
          </a>
          <a
            href="https://docs.google.com/document/d/1rV_RGhXzO1cZ04QJOgu2zaK7lpR1dp_9EV8fYi_5q4g/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="btn btn-primary btn-lg mr-3">Nonprofit/Donor Ambassador</button>
          </a>
        </div>
      </div>
    );
  }
}

export default Careers;
