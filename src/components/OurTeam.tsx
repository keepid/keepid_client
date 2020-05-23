import React from 'react';
import { Helmet } from 'react-helmet';
import ConnorJPG from '../static/images/connor.jpg';
import SteffenJPG from '../static/images/steffen.jpg';
import GregJPG from '../static/images/greg.jpg';
import JacksonJPG from '../static/images/jackson.jpg';

interface State {}

class OurTeam extends React.Component<{}, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Our Team</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-4">Our Team</h1>
          <p className="lead pt-3">
            The current team members of Keep.id who are striving to keep your data safe and secure through our electronic storage solution.
          </p>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card m-3">
            <img src={ConnorJPG} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">Connor Chong</h5>
              <p className="card-text">Developer at Keep.id. Serves as the technical product manager and designer.</p>
            </div>
          </div>
          <div className="card member-card m-3">
            <img src={SteffenJPG} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">Steffen Cornwell</h5>
              <p className="card-text">Developer at Keep.id. Serves as the product&apos;s front end lead.</p>
            </div>
          </div>
          <div className="card member-card m-3">
            <img src={GregJPG} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">Gregory Kofman</h5>
              <p className="card-text">Developer at Keep.id. Serves as the product&apos;s back end and database lead.</p>
            </div>
          </div>
          <div className="card member-card m-3">
            <img src={JacksonJPG} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">Jackson Foltz</h5>
              <p className="card-text">Our Nonprofit Ambassador and Marketing Lead.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OurTeam;
