import React from 'react';
import { Helmet } from 'react-helmet';
import ConnorJPG from '../../static/images/members/connor.jpg';
import SteffenJPG from '../../static/images/members/steffen.jpg';
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
import Sarah from '../../static/images/members/anna.jpg';
import Victoria from '../../static/images/members/victoria.jpg';
import Vanessa from '../../static/images/members/vanessa.jpg';

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
              <p className="card-text">Founder / CEO / CTO / Product Manager</p>
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
              <p className="card-text">Founder / Nonprofit Ambassador / Donor Strategy Lead</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={GregJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Gregory Kofman</h5>
              <p className="card-text">Founder / Software Engineer</p>
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
            <img src={Cathy} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Cathy Chen</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Vanessa} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Vanessa Hu</h5>
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
              <p className="card-text">UI/UX Designer</p>
            </div>
          </div>

          <div className="card member-card mr-4 mb-4">
            <img src={Sophia} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Sophia Ye</h5>
              <p className="card-text">UI/UX Designer</p>
            </div>
          </div>

        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Nonprofit Communications</h3>
        </div>
        <div className="card member-card mr-4 mb-4">
          <img src={Sarah} className="card-img-top " alt="..." />
          <div className="card-body">
            <h5 className="card-title">Sarah Kim</h5>
            <p className="card-text">Nonprofit Liaison</p>
          </div>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={ChrisJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Christopher Ng</h5>
              <p className="card-text">Nonprofit Liaison</p>
            </div>
          </div>

        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Business</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={Abhai} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Abhai Shukla</h5>
              <p className="card-text">Business Analyst</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Ani} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Ani Agrawal</h5>
              <p className="card-text">Donor Strategy</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Victoria} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Victoria Walter</h5>
              <p className="card-text">Fundraising Lead</p>
            </div>
          </div>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h3 className="display-5">Past Members</h3>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card member-card mr-4 mb-4">
            <img src={DanJPG} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Daniel Barychev</h5>
              <p className="card-text">Software Engineer / Security Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Sydney} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Sydney Cheng</h5>
              <p className="card-text">Business Analyst / Nonprofit Ambassador</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Ivorine} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Ivorine Do</h5>
              <p className="card-text">Business Analyst / Social Media Manager</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Abhishek} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Abhishek Pandya</h5>
              <p className="card-text">Software Engineer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Gio} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Gio Ballesteros</h5>
              <p className="card-text">UI/UX Designer</p>
            </div>
          </div>
          <div className="card member-card mr-4 mb-4">
            <img src={Jonathan} className="card-img-top " alt="..." />
            <div className="card-body">
              <h5 className="card-title">Jonathan Xue</h5>
              <p className="card-text">UI/UX Designer</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OurTeam;
