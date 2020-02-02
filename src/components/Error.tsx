import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import NotFoundSVG from '../static/images/page-not-found.svg';

class Error extends Component {
  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Error</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-2 text-center">
          <img className="w-50 p-4" src={NotFoundSVG} />
          <h1 className="display-5">Error: Page Not Found</h1>
          <p className="lead pt-3">
            The page you tried to visit does not exist, or you do not have permission.
          </p>
        </div>
      </div>
    );
  }
}

export default Error;
