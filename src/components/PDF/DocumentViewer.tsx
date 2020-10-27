import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

interface Props {
  pdfFile: File,
}

class DocumentViewer extends Component<Props> {
  render() {
    const {
      pdfFile,
    } = this.props;
    return (
      <div className="container-fluid">
        <Helmet>
          <title>
            Document:
            {' '}
            {pdfFile.name}
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
