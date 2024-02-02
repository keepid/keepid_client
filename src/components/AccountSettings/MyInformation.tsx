import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

class MyInformation extends Component<{}, {}> {
  render() {
    return (
      <div className="md:container md:mx-auto">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="tw-container">
          <div className="tw-flex tw-flex-col">
            <div className="tw-flex-row">
              <div>
                <p>
                  Basic Information
                </p>
                <p>
                  Family Information
                </p>
                <p>
                  Demographic Information
                </p>
                <p>
                  Veteran Status Information
                </p>
                <p>
                  Recent Activity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyInformation;
