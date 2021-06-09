import React from 'react';
import { Helmet } from 'react-helmet';

import BaseCard, { CardImageLoc, CardSize } from '../../components/BaseComponents/BaseCard';
import Abhai from '../../static/images/members/Abhai.jpg';
import AmandaYen from '../../static/images/members/amandaYen.png';
import AnkitaSethi from '../../static/images/members/ankitaSethi.jpg';
import Anna from '../../static/images/members/anna.jpg';
import AnnToo from '../../static/images/members/annToo.jpg';
import Austin from '../../static/images/members/austin.jpg';
import Cathy from '../../static/images/members/cathy.jpg';
import ConnorJPG from '../../static/images/members/connor.jpg';
import DanielJoo from '../../static/images/members/danielJoo.jpg';
import DavidGlaser from '../../static/images/members/davidGlaser.jpg';
import EmilySu from '../../static/images/members/emilySu.jpg';
import GaganKang from '../../static/images/members/gaganKang.jpg';
import JackieJPG from '../../static/images/members/jackie.jpg';
import JacksonJPG from '../../static/images/members/jackson.jpg';
import Jamie from '../../static/images/members/jamie.jpg';
import JessicaHung from '../../static/images/members/jessicaHung.jpg';
import Joey from '../../static/images/members/joey.jpg';
import JohnJPG from '../../static/images/members/john.jpg';
import KierenGill from '../../static/images/members/kierenGill.jpg';
import MaggieLin from '../../static/images/members/maggieLin.jpg';
import Melinda from '../../static/images/members/melinda.png';
import Michelle from '../../static/images/members/michelle.jpg';
import NickRodriguez from '../../static/images/members/nickRodriguez.jpg';
import SamBarraza from '../../static/images/members/samBarraza.jpg';
import SeemranRashid from '../../static/images/members/seemranRashid.jpg';
import SteffenJPG from '../../static/images/members/steffenCornwell.jpg';
import Xander from '../../static/images/members/xander.png';

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
            cardTitle="Melinda Cardenas"
            cardText="Software Engineer"
            imageSrc={Melinda}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Xander Cernek"
            cardText="Software Engineer"
            imageSrc={Xander}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Cathy Chen"
            cardText="Software Engineer"
            imageSrc={Cathy}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Ankita Sethi"
            cardText="Software Engineer"
            imageSrc={AnkitaSethi}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Jackie Peng"
            cardText="Software Engineer"
            imageSrc={JackieJPG}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Austin Wu"
            cardText="Software Engineer"
            imageSrc={Austin}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Joey Zhao"
            cardText="Software Engineer"
            imageSrc={Joey}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
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
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Gagan Kang"
            cardText="Software Engineer"
            imageSrc={GaganKang}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Design and UI/UX</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Anna Leong"
            cardText="UI/UX Design Lead"
            imageSrc={Anna}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Strategic Communications</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Jamie Lu"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={Jamie}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Amanda Yen"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={AmandaYen}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Kieren Gill"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={KierenGill}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Maggie Lin"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={MaggieLin}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Sam Barrazza"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={SamBarraza}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Donor Strategy</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Seemran Rashid"
            cardText="Donor Strategy Analyst"
            imageSrc={SeemranRashid}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Product Management</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Emily Su"
            cardText="Business Analyst"
            imageSrc={EmilySu}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
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
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Abhai Shukla"
            cardText="ID Researcher"
            imageSrc={Abhai}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
          <BaseCard
            cardSize={CardSize.MEDIUM_VERTICAL}
            cardTitle="Ann Too"
            cardText="Financial Accountant and ID Researcher"
            imageSrc={AnnToo}
            imageAlt="..."
            imageLoc={CardImageLoc.TOP}
            imageSize={imgSize}
          />
        </div>
      </div>
    );
  }
}

export default OurTeam;
