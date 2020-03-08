import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

// SOME HOME COMPONENT THAT WILL BE FINISHED AT A FUTURE DATE
class Home extends Component<{}, {}, {}> {
  render() {
    return (
      <div className="container-fluid">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
      </div>
    );
  }
}

export default Home;
