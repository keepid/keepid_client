import React from 'react';
import { Helmet } from 'react-helmet';

interface State {}

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
        </div>
        <div className="row">
          <a href="https://bit.ly/keepid-about-us" target="_blank" rel="noopener noreferrer"><button type="button" className="btn btn-primary btn-lg mr-3">About Us</button></a>
          <a href="https://bit.ly/keepid-software" target="_blank" rel="noopener noreferrer"><button type="button" className="btn btn-primary btn-lg mr-3">Software Engineer</button></a>
          <a href="https://bit.ly/keepid-security" target="_blank" rel="noopener noreferrer"><button type="button" className="btn btn-primary btn-lg mr-3">Security Engineer</button></a>
          <a href="https://bit.ly/keepid-designer" target="_blank" rel="noopener noreferrer"><button type="button" className="btn btn-primary btn-lg mr-3">UI/UX Designer</button></a>
        </div>
      </div>
    );
  }
}

export default Careers;
