import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface Props {
  pdfFile: string | File,
}

class DocumentViewer extends Component<Props> {
  render() {
    const {
      pdfFile,
    } = this.props;
    console.log(pdfFile);
    if (typeof (pdfFile) === 'string') {
      return (
        <div className="container-fluid">
          <Helmet>
            <title>
Document:

            </title>
            <meta name="description" content="Keep.id" />
          </Helmet>
          <object data={pdfFile}>
            <embed src={pdfFile} />
          </object>
        </div>
      );
    }
  }
}

export default DocumentViewer;
