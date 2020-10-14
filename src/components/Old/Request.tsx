import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import RequestLogo from '../../static/images/request.svg';

class Request extends Component<{}, {}, {}> {
  render() {
    return (
      <div className="container-fluid">
        <Helmet>
          <title>Request Documents</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-6">
            <img src={RequestLogo} className="float-right mt-2" alt="Print" />
          </div>
          <div className="col-md-6 mt-4">
            <h3 className="textPrintHeader">
              Request My Documents
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="textPrintDesc mt-3">
              <span>Click the box next to every document you would like to request, then click the “Request” button in the bottom right.</span>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 overflow-auto" id="printTable">
            <table className="table table-bordered table-hover">
              <tbody>
                <tr>
                  <td>
                    <input className="form-check-input" type="checkbox" value="" id="defaultCheck1" />
                  </td>
                  <td>
                    Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <input className="form-check-input" type="checkbox" value="" id="defaultCheck2" />
                  </td>
                  <td>
                    Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <input className="form-check-input" type="checkbox" value="" id="defaultCheck2" />
                  </td>
                  <td>
                    Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <input className="form-check-input" type="checkbox" value="" id="defaultCheck2" />
                  </td>
                  <td>
                    Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <input className="form-check-input" type="checkbox" value="" id="defaultCheck2" />
                  </td>
                  <td>
                    Document name
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn btn-lg">
            Request
          </button>
        </div>
      </div>
    );
  }
}

export default Request;
