import React from 'react';
import { Helmet } from 'react-helmet';

import BaseCard, { CardImageLoc, CardSize } from '../../components/BaseComponents/BaseCard';
import ConnorJPG from '../../static/images/members/connor.jpg';
import DanielJoo from '../../static/images/members/danielJoo.jpg';
import JacksonJPG from '../../static/images/members/jackson.jpg';
import JessicaHung from '../../static/images/members/jessicaHung.jpg';
import JohnJPG from '../../static/images/members/john.jpg';
import NickRodriguez from '../../static/images/members/nickRodriguez.jpg';
import SteffenJPG from '../../static/images/members/steffenCornwell.jpg';

interface State {}

class OurTeam extends React.Component<{}, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const imgSize = '65%';
    return (
      <div className="container">
        <Helmet>
          <title>Our Team</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="mb-2">Our Team</h1>
          <p className="lead-medium pt-2">
            The current team members of Keep.id who are striving to keep your data safe and secure through our
            electronic storage solution, listed alphabetically.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">The Board</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="John Baek"
            cardText="Founder / COO / Legal Analyst"
            imageSrc={JohnJPG}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Connor Chong"
            cardText="Founder / CEO / CTO"
            imageSrc={ConnorJPG}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Steffen Cornwell"
            cardText="Founder / Executive Director / Product Manager"
            imageSrc={SteffenJPG}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Jackson Foltz"
            cardText="Founder / Strategic Communications Lead"
            imageSrc={JacksonJPG}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Jessica Hung"
            cardText="Donor Strategy Lead"
            imageSrc={JessicaHung}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Engineering</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Nick Rodriguez"
            cardText="Software Engineer"
            imageSrc={NickRodriguez}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Daniel Joo"
            cardText="Software Engineer"
            imageSrc={DanielJoo}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        {/* <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Design and UI/UX</h3>
        </div> */}
        {/* <div className="d-flex flex-wrap">
        </div> */}
        {/* <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Strategic Communications</h3>
        </div>
        <div className="d-flex flex-wrap">
        </div> */}
        {/* <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Donor Strategy</h3>
        </div>
        <div className="d-flex flex-wrap">
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Product Management</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="David Glaser"
            cardText="Business Analyst"
            imageSrc={DavidGlaser}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Operations and Legal</h3>
        </div>
        <div className="d-flex flex-wrap">
        </div> */}
      </div>
    );
  }
}

export default OurTeam;
