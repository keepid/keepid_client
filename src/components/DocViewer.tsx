import React, { Component } from 'react';

// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

class DocViewer extends Component<{}> {
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2 className="text-center">
                        Document Title Here
            </h2>
          </div>
        </div>
        <div className="row embed-responsive embed-responsive-16by9">
          <iframe className="embed-responsive-item" src="eula-template.pdf" title="Document" />
        </div>
      </div>
    );
  }
}

export default DocViewer;
