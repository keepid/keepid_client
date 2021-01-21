import React from 'react';
import { Helmet } from 'react-helmet';
import ConnorJPG from '../../static/images/members/connor.jpg';
import SteffenJPG from '../../static/images/members/steffenCornwell.jpg';
import JacksonJPG from '../../static/images/members/jackson.jpg';
import JackieJPG from '../../static/images/members/jackie.jpg';
import JohnJPG from '../../static/images/members/john.jpg';
import Cathy from '../../static/images/members/cathy.jpg';
import Joey from '../../static/images/members/joey.jpg';
import Melinda from '../../static/images/members/melinda.png';
import Abhai from '../../static/images/members/Abhai.jpg';
import Austin from '../../static/images/members/austin.jpg';
import Anna from '../../static/images/members/anna.jpg';
import Jamie from '../../static/images/members/jamie.jpg';
import Xander from '../../static/images/members/xander.png';
import MaggieLin from '../../static/images/members/maggieLin.jpg';
import JessicaHung from '../../static/images/members/jessicaHung.jpg';
import EmilySu from '../../static/images/members/emilySu.jpg';
import SeemranRashid from '../../static/images/members/seemranRashid.jpg';
import DanielJoo from '../../static/images/members/danielJoo.jpg';
import NickRodriguez from '../../static/images/members/nickRodriguez.jpg';
import AnnToo from '../../static/images/members/annToo.jpg';
import GaganKang from '../../static/images/members/gaganKang.jpg';
import DavidGlaser from '../../static/images/members/davidGlaser.jpg';
import AnkitaSethi from '../../static/images/members/ankitaSethi.jpg';
import KierenGill from '../../static/images/members/kierenGill.jpg';
import AmandaYen from '../../static/images/members/amandaYen.png';
import SamBarraza from '../../static/images/members/samBarazza.jpg';

import BaseCard from '../../components/Base/BaseCard';

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
            The current team members of Keep.id who are striving to keep your data safe and secure through our electronic storage solution, listed alphabetically.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">The Board</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="John Baek"
            cardText="Founder / COO / Legal Analyst"
            imageSrc={JohnJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Connor Chong"
            cardText="Founder / CEO / CTO"
            imageSrc={ConnorJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Steffen Cornwell"
            cardText="Founder / Executive Director / Product Manager"
            imageSrc={SteffenJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jackson Foltz"
            cardText="Founder / Strategic Communications Lead"
            imageSrc={JacksonJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jessica Hung"
            cardText="Donor Strategy Lead"
            imageSrc={JessicaHung}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Engineering</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Melinda Cardenas"
            cardText="Software Engineer"
            imageSrc={Melinda}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Xander Cernek"
            cardText="Software Engineer"
            imageSrc={Xander}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Cathy Chen"
            cardText="Software Engineer"
            imageSrc={Cathy}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Ankita Sethi"
            cardText="Software Engineer"
            imageSrc={AnkitaSethi}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jackie Peng"
            cardText="Software Engineer"
            imageSrc={JackieJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Austin Wu"
            cardText="Software Engineer"
            imageSrc={Austin}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Joey Zhao"
            cardText="Software Engineer"
            imageSrc={Joey}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Nick Rodriguez"
            cardText="Software Engineer"
            imageSrc={NickRodriguez}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Daniel Joo"
            cardText="Software Engineer"
            imageSrc={DanielJoo}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Gagan Kang"
            cardText="Software Engineer"
            imageSrc={GaganKang}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Design and UI/UX</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Anna Leong"
            cardText="UI/UX Design Lead"
            imageSrc={Anna}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Strategic Communications</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jamie Lu"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={Jamie}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Amanda Yen"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={AmandaYen}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Kieren Gill"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={KierenGill}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Maggie Lin"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={MaggieLin}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Sam Barrazza"
            cardText="Nonprofit Strategy Analyst"
            imageSrc={SamBarraza}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Donor Strategy</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Seemran Rashid"
            cardText="Donor Strategy Analyst"
            imageSrc={SeemranRashid}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Product Management</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Emily Su"
            cardText="Business Analyst"
            imageSrc={EmilySu}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="David Glaser"
            cardText="Business Analyst"
            imageSrc={DavidGlaser}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Operations and Legal</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Abhai Shukla"
            cardText="ID Researcher"
            imageSrc={Abhai}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Ann Too"
            cardText="Financial Accountant and ID Researcher"
            imageSrc={AnnToo}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
      </div>
    );
  }
}

export default OurTeam;
