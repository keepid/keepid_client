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
    const pdfFileURL : string = (window.URL ? URL : webkitURL).createObjectURL(pdfFile);
    console.log(pdfFileURL);
    return (
      <div className="container-fluid">
        <Helmet>
          <title>
Document:
            {pdfFile.name}
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <object data={pdfFileURL} type="application/pdf" >
          <embed src={pdfFileURL} type="application/pdf" />
        </object>
      </div>
    );
  }
}

export default DocumentViewer;
