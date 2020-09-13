import React from 'react';
import { Helmet } from 'react-helmet';

interface State {}

class OurMission extends React.Component<{}, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Our Mission</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Mission Statement</h1>
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
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Values</h1>
          <p className="lead pt-3">
            Our three pillars are
            {' '}
            <b>collaboration</b>
            ,
            {' '}
            <b>purpose</b>
            , and
            {' '}
            <b>empathy</b>
            .
            <ul>
              <li className="pt-2">
                <b>Collaboration:</b>
                {' '}
                We understand that without working closely with existing organizations and human support networks,
                we cannot generate any substantial impact with great technology alone.
              </li>
              <li className="pt-1">
                <b>Purpose:</b>
                {' '}
                We understand the particular position and information we have on a disadvantaged population. We aim to create sustainable,
                impact-driven features that have beneficial implications for those who entrust us with their data.
              </li>
              <li className="pt-1">
                <b>Empathy:</b>
                {' '}
                Without practicing empathy, we begin to abandon our mission and will succumb to the capitalist forces of systemic greed and exploitation. We need empathy to ensure that we never demean or exploit those whom we are supposed to help.
              </li>
            </ul>
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Product Vision</h1>
          <p className="lead pt-3">
            Our product, Keep.id, aims to build a safety net around experienced homelessness by providing electronic document storage and complementary features. We envision Keep.id as a financially sustainable, HIPAA-compliant application that serves partner organizations in the Philadelphia community, and in the future, scales to various regional hubs experiencing homelessness in the U.S. We have three main goals for achieving this vision:
            <ul>
              <li className="pt-2">
                <b>HIPAA Compliance</b>
                {' '}
                is a major engineering milestone that signals the technical integrity of our product.
              </li>
              <li className="pt-1">
                <b>Receiving Funding</b>
                {' '}
                through competitions, grants, and contributions. This will ensure the financial sustainability of our venture, allowing for long term support, the addition of new features, and technical scalability.
              </li>
              <li className="pt-1">
                <b>Achieve Local Buy-in</b>
                {' '}
                from local partner organizations in the regional hub we are focusing in. Our technology may not reach homeless populations directly, but local partners can.
              </li>
            </ul>
          </p>
        </div>
      </div>
    );
  }
}

export default OurMission;
