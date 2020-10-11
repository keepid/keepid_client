import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import UploadSVG from '../../static/images/uploading-files-to-the-cloud.svg';
import RequestSVG from '../../static/images/request.svg';
import AppSVG from '../../static/images/calendar.svg';
import EmailSVG from '../../static/images/email.svg';
import FileSVG from '../../static/images/file.svg';

class ClientLanding extends Component<{}, {}, {}> {
  render() {
    return (
      <div id="Buttons" className="container pt-5">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row m-auto mt-5">
          <div className="d-flex p-2" id="Print container">
            <Link to="/my-documents">
              <div className="rectangle pt-2">
                <img className="normalImage" src={FileSVG} alt="Print" />
                <p className="textLanding mt-4 pt-3">My Documents</p>
              </div>

            </Link>
          </div>
          <div className="d-flex p-2" id="Applications container">
            <Link to="/applications">
              <div className="rectangle pt-2">
                <img className="normalImage" src={AppSVG} alt="Applications" />
                <p className="textLanding mt-5">My Applications</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ClientLanding;
