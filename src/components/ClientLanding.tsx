import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import UploadSVG from '../static/images/uploading-files-to-the-cloud.svg';
import RequestSVG from '../static/images/request.svg';
import AppSVG from '../static/images/calendar.svg';
import EmailSVG from '../static/images/email-24px.svg';
import AssistSVG from '../static/images/assistance.svg';
import FileSVG from '../static/images/file.svg';

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
    const {
      show,
    } = this.state;
    return (
      <div id="Buttons" className="container">
        <div className="row m-auto">
          <div className="col d-flex" id="Upload container">
            <a href="/upload-document">
              <div className="rectangle mt-5 pt-4">
                <img className="uploadImg pb-2" src={UploadSVG} alt="See" />
                <p className="textLanding">
                  Upload a Document
                </p>
              </div>

            </a>
          </div>
          <div className="col d-flex" id="Print container">
            <a href="/my-documents">
              <div className="rectangle mt-5 pt-2">
                <img className="normalImage" src={FileSVG} alt="Print" />
                <p className="textLanding mt-4 pt-3">See My Documents</p>
              </div>

            </a>
          </div>
          <div className="col d-flex" id="Request container">
            <a href="/request">
              <div className="rectangle mt-5">
                <img className="normalImage" src={RequestSVG} alt="Request" />
                <p className="textLanding mt-3 pt-4">
                  Request My
                  <br />
                  Documents
                </p>
              </div>
            </a>
          </div>
          <div className="col d-flex" id="Applications container">
            <a href="/applications">
              <div className="rectangle mt-5 pt-2">
                <img className="normalImage" src={AppSVG} alt="Applications" />
                <p className="textLanding mt-5">My Applications</p>
              </div>
            </a>
          </div>
          <div className="col d-flex" id="Email container">
            <a href="/email">
              <div className="rectangle mt-5 pt-2">
                <img className="normalImage" src={EmailSVG} alt="Email" />
                <p className="textLanding mt-5">Send an Email</p>
              </div>
            </a>
          </div>
          <div className="col d-flex">
            <button type="button" className="btn btn-assist mt-5" onClick={this.showModal}>
              <div className="rectangle pt-2">
                <img className="normalImage" src={AssistSVG} alt="Assistance" />
                <p className="textLanding mt-5">Need Assistance?</p>
              </div>
            </button>
          </div>
        </div>
        <Modal show={show} onHide={this.hideModal}>
          <section className="modal-header background">
            <h5 className="modal-title" id="assistTitle">FAQ</h5>
            <button type="button" className="close" onClick={this.hideModal}>
              <span>&times;</span>
            </button>
          </section>
          <section className="modal-main">
            <p>
                sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              <br />
              <br />
                Send all technical issues to admin@keep.id
            </p>
          </section>
        </Modal>
      </div>
    );
  }
}

export default ClientLanding;
