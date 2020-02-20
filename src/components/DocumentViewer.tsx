import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface Props {
  pdfFile: File,
}

class DocumentViewer extends Component<Props> {
  render() {
    const {
      pdfFile,
    } = this.props;
    console.log(pdfFile);
      return (
        <div className="container-fluid">
          <Helmet>
            <title>
Document:

            </title>
            <meta name="description" content="Keep.id" />
          </Helmet>
          <div className="row embed-responsive embed-responsive-16by9 align-content-center">
            <iframe className="embed-responsive-item" src={window.URL.createObjectURL(pdfFile)} title="Document" />
          </div>
        </div>
      );
    }
  }

export default DocumentViewer;
