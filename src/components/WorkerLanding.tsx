import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    username: string,
    name: string,
    organization: string,
  }
  
  interface State {
    username: string,
    adminName: string,
    organization: string,
  }

class WorkerLanding extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: props.username,
      adminName: props.name,
      organization: props.organization,
    };
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron pt-5 pb-3 jumbotron-fluid">
          <div className="container">
            <h1 className="display-5">My Clients</h1>
            <p className="lead">Use the search bar to help look up clients.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default WorkerLanding;
