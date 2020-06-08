import React from 'react';
import Alert from 'react-bootstrap/Alert';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';
import NotFoundSVG from '../static/images/page-not-found.svg';

interface Props {
}

interface State {
  redirect: boolean,
}

const timeUntilRedirect: number = 3 * 1000;

class Error extends React.Component<Props, State> {
  private redirectTimeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: false,
    };
    this.handleRedirect = this.handleRedirect.bind(this);
    this.setTimeout = this.setTimeout.bind(this);
    this.setTimeout();
  }

  // set a timeout, after which the user will be redirected to the login screen
  setTimeout() {
    this.redirectTimeout = setTimeout(this.handleRedirect, timeUntilRedirect);
  }

  handleRedirect() {
    // clear the timeout
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    this.setState({ redirect: true });
  }

  render() {
    const {
      redirect,
    } = this.state;

    if (redirect) {
      return <Redirect to="/home" />;
    }

    return (
      <div className="container">
        <Helmet>
          <title>Error</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <Alert variant="warning">
          Redirecting you back to the login page...
        </Alert>
        <div className="jumbotron-fluid mt-2 text-center">
          <img alt="404 Error Not Found" className="w-50 p-4" src={NotFoundSVG} />
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
