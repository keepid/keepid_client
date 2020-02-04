import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface Props {
  pdfFile: File,
}

class DocumentViewer extends Component<Props, {}> {
  render() {
    const {
      pdfFile,
    } = this.props;
    return (
      <div className="container-fluid">
        <Helmet>
          <title>Document: Document Title Here</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-12">
            <h2 className="text-center">
              {pdfFile.name}
            </h2>
          </div>
        </div>
        <div className="row embed-responsive embed-responsive-16by9 align-content-center">
          <iframe id="pdf-shower" className="embed-responsive-item" src={window.URL.createObjectURL(pdfFile)} title="Document" />
        </div>
      </div>
    );
  }
}

export default DocumentViewer;
