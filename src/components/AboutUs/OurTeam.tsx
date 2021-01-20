import React from 'react';
import { Helmet } from 'react-helmet';
import ConnorJPG from '../../static/images/members/connor.jpg';
import SteffenJPG from '../../static/images/members/steffenCornwell.jpg';
import GregJPG from '../../static/images/members/greg.jpg';
import JacksonJPG from '../../static/images/members/jackson.jpg';
import JackieJPG from '../../static/images/members/jackie.jpg';
import JohnJPG from '../../static/images/members/john.jpg';
import ChrisJPG from '../../static/images/members/chris.jpg';
import DanJPG from '../../static/images/members/dan.jpg';
import Gio from '../../static/images/members/gio.jpg';
import Cathy from '../../static/images/members/cathy.jpg';
import Joey from '../../static/images/members/joey.jpg';
import Jonathan from '../../static/images/members/jonathan.jpg';
import Melinda from '../../static/images/members/melinda.png';
import Sydney from '../../static/images/members/Sydney.png';
import Sophia from '../../static/images/members/sophia.jpg';
import Abhai from '../../static/images/members/Abhai.jpg';
import Abhishek from '../../static/images/members/abhishek.jpg';
import Ani from '../../static/images/members/ani.jpg';
import Ivorine from '../../static/images/members/ivorine.jpg';
import Austin from '../../static/images/members/austin.jpg';
import Anna from '../../static/images/members/anna.jpg';
import Sarah from '../../static/images/members/sarah.png';
import Victoria from '../../static/images/members/victoria.jpg';
import Vanessa from '../../static/images/members/vanessa.jpg';
import Jamie from '../../static/images/members/jamie.jpg';
import Janelle from '../../static/images/members/janelle.png';
import Xander from '../../static/images/members/xander.png';
import Michelle from '../../static/images/members/michelleYi.jpg';
import JessicaHo from '../../static/images/members/jessicaHo.png';
import MaggieLin from '../../static/images/members/maggieLin.jpg';
import EmilyHong from '../../static/images/members/emilyHong.jpg';
import JessicaHung from '../../static/images/members/jessicaHung.jpg';
import EmilySu from '../../static/images/members/emilySu.jpg';
import JamesBigbee from '../../static/images/members/jamesBigbee.jpg';
import SeemranRashid from '../../static/images/members/seemranRashid.jpg';
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
            cardText="Founder / CEO / CTO / Product Manager"
            imageSrc={ConnorJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Steffen Cornwell"
            cardText="Founder / Executive Director"
            imageSrc={SteffenJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jackson Foltz"
            cardText="Founder / Nonprofit Ambassador / Donor Strategy Lead"
            imageSrc={JacksonJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Gregory Kofman"
            cardText="Founder / Software Engineer"
            imageSrc={GregJPG}
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
            cardTitle="Vanessa Hu"
            cardText="Software Engineer"
            imageSrc={Vanessa}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Janelle Leung"
            cardText="Software Engineer"
            imageSrc={Janelle}
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
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Design and UI/UX</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Anna Leong"
            cardText="UI/UX Designer"
            imageSrc={Anna}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Sophia Ye"
            cardText="UI/UX Designer"
            imageSrc={Sophia}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Michelle Yi"
            cardText="UI/UX Designer"
            imageSrc={Michelle}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Nonprofit Communications</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Sarah Kim"
            cardText="Nonprofit Liaison"
            imageSrc={Sarah}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jamie Lu"
            cardText="Nonprofit Liaison"
            imageSrc={Jamie}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Christopher Ng"
            cardText="Nonprofit Liaison"
            imageSrc={ChrisJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Business</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Ani Agrawal"
            cardText="Donor Strategy"
            imageSrc={Ani}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Abhai Shukla"
            cardText="Business Analyst"
            imageSrc={Abhai}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Emily Hong"
            cardText="Business Analyst"
            imageSrc={EmilyHong}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jessica Ho"
            cardText="Business Analyst"
            imageSrc={JessicaHo}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jessica Hung"
            cardText="Donor Strategy"
            imageSrc={JessicaHung}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Maggie Lin"
            cardText="Business Analyst"
            imageSrc={MaggieLin}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Seemran Rashid"
            cardText="Donor Strategy"
            imageSrc={SeemranRashid}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
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
            cardTitle="Victoria Walter"
            cardText="Donor Strategy"
            imageSrc={Victoria}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Past Members</h3>
        </div>
        <div className="d-flex flex-wrap">
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Daniel Barychev"
            cardText="Software Engineer / Security Engineer"
            imageSrc={DanJPG}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="James Bigbee"
            cardText="Software Engineer"
            imageSrc={JamesBigbee}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Sydney Cheng"
            cardText="Business Analyst / Nonprofit Ambassador"
            imageSrc={Sydney}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Ivorine Do"
            cardText="Business Analyst / Social Media Manager"
            imageSrc={Ivorine}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Abhishek Pandya"
            cardText="Software Engineer"
            imageSrc={Abhishek}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Gio Ballesteros"
            cardText="UI/UX Designer"
            imageSrc={Gio}
            imageAlt="..."
            imageLoc="top"
            imageSize={imgSize}
          />
          <BaseCard
            cardSize="small-vertical"
            cardTitle="Jonathan Xue"
            cardText="UI/UX Designer"
            imageSrc={Jonathan}
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
