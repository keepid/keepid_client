import React from 'react';
import { Helmet } from 'react-helmet';
import BSMJPG from '../static/images/bsm.jpg';

interface State {}

class OurPartners extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Our Partners</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-4">Our Partners</h1>
          <p className="lead pt-3">
            The partner organizations of Keep.id who are working on the ground to maintain the safety and accessibility of your data.
          </p>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card partner-card m-3">
            <img src={BSMJPG} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">Broad Street Ministries</h5>
              <p className="card-text">
We transform our city, our institutions,
              and ourselves when we embrace the individual needs of our most vulnerable sisters and brothers.
              </p>
              <a href="https://www.broadstreetministry.org/" className="card-link">Website</a>
              <a href="https://www.facebook.com/BroadStreetMinistry/" className="card-link">Facebook Page</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OurPartners;
