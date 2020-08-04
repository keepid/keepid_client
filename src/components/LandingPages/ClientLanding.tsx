import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import UploadSVG from '../../static/images/uploading-files-to-the-cloud.svg';
import RequestSVG from '../../static/images/request.svg';
import AppSVG from '../../static/images/calendar.svg';
import EmailSVG from '../../static/images/email.svg';
import AssistSVG from '../../static/images/assistance.svg';
import FileSVG from '../../static/images/file.svg';

interface State {
  show: boolean
}

class ClientLanding extends Component<{}, State, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      show: false,
    };
  }

  showModal = () => {
    this.setState({ show: true });
  }

  hideModal = () => {
    this.setState({ show: false });
  }

  render() {
    return (
      <div id="Buttons" className="container pt-5">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row m-auto mt-5">
          <div className="d-flex p-3" id="Upload container">
            <Link to="/upload-document">
              <div className="rectangle pt-4">
                <img className="uploadImg pb-2" src={UploadSVG} alt="See" />
                <p className="textLanding">
                  Upload a Document
                </p>
              </div>
            </Link>
          </div>
          <div className="d-flex p-3" id="Print container">
            <Link to="/my-documents">
              <div className="rectangle pt-2">
                <img className="normalImage" src={FileSVG} alt="Print" />
                <p className="textLanding mt-4 pt-3">My Documents</p>
              </div>

            </Link>
          </div>
          <div className="d-flex p-3" id="Request container">
            <Link to="/request">
              <div className="rectangle">
                <img className="normalImage" src={RequestSVG} alt="Request" />
                <p className="textLanding mt-3 pt-4">
                  Request Documents
                </p>
              </div>
            </Link>
          </div>
          <div className="d-flex p-3" id="Applications container">
            <Link to="/applications">
              <div className="rectangle pt-2">
                <img className="normalImage" src={AppSVG} alt="Applications" />
                <p className="textLanding mt-5">My Applications</p>
              </div>
            </Link>
          </div>
          <div className="d-flex p-3" id="Email container">
            <Link to="/email">
              <div className="rectangle pt-2">
                <img className="normalImage" src={EmailSVG} alt="Email" />
                <p className="textLanding mt-5">Send an Email</p>
              </div>
            </Link>
          </div>
          <div className="d-flex p-3">
            <button type="button" className="btn btn-assist" onClick={this.showModal}>
              <div className="rectangle pt-2">
                <img className="normalImage" src={AssistSVG} alt="Assistance" />
                <p className="textLanding mt-5">Need Assistance?</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ClientLanding;
