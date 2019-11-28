import React, { Component } from 'react';
import PrintLogo from '../static/images/print.svg';

interface State {
	loggedIn: boolean,
}

class Print extends Component<{}, State, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      loggedIn: true, // Change to true in order to show landing logged in
    };
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <img src={PrintLogo} className="float-right mt-2" alt="Print" />
          </div>
          <div className="col-md-6 mt-4">
            <h3 className="textPrintHeader">
                        Print Documents
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="textPrintDesc mt-3">
              <span>Click the box next to every document you would like to print out, then click the “Print” button in the bottom right.</span>
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
                Print
          </button>
        </div>
      </div>
    );
  }
}

export default Print;
