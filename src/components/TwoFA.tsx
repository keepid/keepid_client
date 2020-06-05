import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import NotFoundSVG from '../static/images/page-not-found.svg';
import getServerURL from '../serverOverride';

interface Props {
  jwt: string
}

interface State {
  isValid: boolean,
  validityMessage: string
}

class TwoFA extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isValid: false,
      validityMessage: 'nothing'
    };

    this.verifyJWT = this.verifyJWT.bind(this);
  }

  componentDidMount() {
    this.verifyJWT();
  }

  verifyJWT() {
    const {
      isValid,
    } = this.state;

    fetch(`${getServerURL()}/two-factor/${this.props.jwt}`, {
      method: 'POST',
      credentials: 'include',
    }).then((res) => res.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);

        const returnMessage = responseJSON.message;
        const returnStatus = responseJSON.status;

        this.setState({
            validityMessage: returnMessage,
        });

        if (returnMessage) {
          this.setState({
            isValid: true,
          });
        }
      });
  }

  render() {
    console.log(this.state.validityMessage)
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
