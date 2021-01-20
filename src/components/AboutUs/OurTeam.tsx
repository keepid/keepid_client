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
          <h1 className="mb-2">Our Team</h1>
          <p className="lead-medium pt-2">
            The current team members of Keep.id who are striving to keep your data safe and secure through our electronic storage solution, listed alphabetically.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">The Board</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={JohnJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">John Baek</h5>
              <p className="card-text">Founder / COO / Legal Analyst</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={ConnorJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Connor Chong</h5>
              <p className="card-text">Founder / CEO / CTO</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={SteffenJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Steffen Cornwell</h5>
              <p className="card-text">Founder / Executive Director</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={JacksonJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Jackson Foltz</h5>
              <p className="card-text">Founder / Strategic Communications Lead</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={JessicaHung} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Jessica Hung</h5>
              <p className="card-text">Donor Strategy Lead</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Engineering</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={Melinda} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Melinda Cardenas</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Xander} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Xander Cernek</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={GaganKang} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Gagan Kang</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={NickRodriguez} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Nick Rodriguez</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={AnkitaSethi} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Ankita Sethi</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Cathy} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Cathy Chen</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={DanielJoo} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Daniel Joo</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={JackieJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Jackie Peng</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Austin} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Austin Wu</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Joey} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Joey Zhao</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Design and UI/UX</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={Anna} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Anna Leong</h5>
              <p className="card-text">UI/UX Design Lead</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Strategic Communications</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={Jamie} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Jamie Lu</h5>
              <p className="card-text">Nonprofit Liaison</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={MaggieLin} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Maggie Lin</h5>
              <p className="card-text">Nonprofit Liaison</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={KierenGill} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Kieren Gill</h5>
              <p className="card-text">Nonprofit Liaison</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Donor Strategy</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={SeemranRashid} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Seemran Rashid</h5>
              <p className="card-text">Donor Strategy</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Product Management</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={EmilySu} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Emily Su</h5>
              <p className="card-text">Product Manager</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={DavidGlaser} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">David Glaser</h5>
              <p className="card-text">Product Manager</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Operations and Legal</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={AnnToo} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Ann Too</h5>
              <p className="card-text">Financial Accountant and ID Researcher</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Abhai} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Abhai Shukla</h5>
              <p className="card-text">Application Operative and ID Researcher</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OurTeam;
