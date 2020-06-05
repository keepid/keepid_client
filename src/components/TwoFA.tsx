import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import NotFoundSVG from '../static/images/page-not-found.svg';
import Role from '../static/Role';
import getServerURL from '../serverOverride';

interface Props {
  jwt: string
}

interface State {
  isValid: boolean
}

class TwoFA extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isValid: false,
    };

    this.verifyJWT = this.verifyJWT.bind(this);
  }

  verifyJWT() {
    const {
      isValid
    } = this.state;

    fetch(`${getServerURL()}/two-factor/${isValid}`, {
      method: 'POST',
      credentials: 'include',
    }).then((res) => res.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        const {
          validityMessage
        } = responseJSON;
        if (validityMessage) {
          this.setState({
            isValid: true
          });
        }
      });
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Error</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-2 text-center">
          <img alt="404 Error Not Found" className="w-50 p-4" src={NotFoundSVG} />
          <h1 className="display-5">Error: Woah there</h1>
          <p className="lead pt-3">
            The page you tried to visit does not exist, or you do not have permission.
          </p>
        </div>
      </div>
    );
  }
}

export default TwoFA;