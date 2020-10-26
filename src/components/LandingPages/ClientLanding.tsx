import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import signPNG from '../../static/images/sign-document.png';



class ClientLanding extends Component<{}, {}, {}> {
  render() {
    return (
      <div id="Buttons" className="container pt-5">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid ml-4 mt-2 row">
          <h1 className="display-4 text-sm-center">Welcome, Name!</h1>
        </div>
        <div className="row ml-2 justify-content-center mt-4">
          <div className="col-md-5 w-100 landing-rectangle p-2 mx-2 mb-2" id="Print container">
            <div className="p-3 row m-auto">
              <h1 className="row ml-4 font-weight-lighter">3 Documents</h1>
              <div className="row mb-2">
                <div className="col-7">
                  <p className="ml-4">Upload, view, and download your documents</p>
                  <div className="mb-3">
                    <Link to="/my-documents" className="p-3">
                      <button className="mt-3 btn btn-primary loginButtonBackground w-30 ld-ext-right">
                        My Documents
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="col-5 m-auto p-2"><img src={signPNG} alt="Print" /></div>
              </div>
            </div>
          </div>
          <div className="col-md-5 w-100 landing-rectangle p-2 mx-2 mb-2" id="Applications container">
            <div className="p-3 row m-auto">
              <h1 className="row ml-4 font-weight-lighter">1 Application</h1>
              <div className="row mb-2">
                <div className="col-7">
                  <p className="ml-4">View, complete, and manage your applications</p>
                  <div className="mb-3">
                    <Link to="/applications" className="p-3">
                      <button className="mt-3 btn btn-primary loginButtonBackground w-30 ld-ext-right">
                        My Applications
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="col-5 m-auto pr-5"><img src={signPNG} alt="Applications" /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-5 mb-3 mx-auto">
          <div className="col-1"/>
          <h3 className="col-10 text-sm-center text-md-left">Recent Activity</h3>
        </div>
        <div className="row pl-2">
          <div className="col-md-1" />
          <div className="col-md-10 m-2 landing-activity justify-content-between align-items-center">
            <div className="row pt-2">
              <h6 className="col-md-6 pt-1 landing-font-color">End User Agreement Application</h6>
              <p className="col-md-6 text-md-right landing-font-color">Uploaded by Market Street Mission, 3 days ago</p>
            </div>
          </div>
        </div>
        <div className="row pl-2">
          <div className="col-md-1" />
          <div className="col-md-10 m-2 landing-activity justify-content-between align-items-center">
            <div className="row pt-2">
              <h6 className="col-md-6 pt-1 landing-font-color">End User Agreement Application</h6>
              <p className="col-md-6 text-md-right landing-font-color">Uploaded by Market Street Mission, 3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClientLanding;
