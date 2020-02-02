import React, { Component } from 'react';
import Calendar from '../static/images/calendar.svg';
import {Helmet} from "react-helmet";

class Applications extends Component<{}, {}, {}> {
  render() {
    return (
      <div className="container-fluid">
        <Helmet>
          <title>Applications</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-6">
            <img src={Calendar} className="float-right mt-2" alt="Calendar" />
          </div>
          <div className="col-md-6 mt-4">
            <h3 className="textPrintHeader">
                        My Applications
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="textPrintDesc mt-3">
              <span>Check the status of each of your applications here - red is rejected, yellow is in-progress, green is accepted</span>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 overflow-auto" id="printTable">
            <table className="table table-bordered table-hover">
              <tbody>
                <tr>
                  <td>
                    <div className="app-status-box" />
                  </td>
                  <td>
                          Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="app-status-box" />
                  </td>
                  <td>
                      Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="app-status-box" />
                  </td>
                  <td>
                          Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="app-status-box" />
                  </td>
                  <td>
                          Document name
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="app-status-box" />
                  </td>
                  <td>
                          Document name
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Applications;
