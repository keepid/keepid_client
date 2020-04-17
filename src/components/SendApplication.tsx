import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from './DocumentViewer';
import getServerURL from '../serverOverride';
const j = require('pdfkit');

interface Props {
}

interface State {
  pdfFile: File | undefined,
}

class SendApplication extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      pdfFile: undefined,
    };
    this.autofillPDF = this.autofillPDF.bind(this);
    this.autofillPDF();
  }

  autofillPDF() {
    //const doc = new PDFDocument();
    //doc.end();
  }

  render() {
    const {
      pdfFile,
    } = this.state;
    return (
      <div>
        { pdfFile ? <DocumentViewer pdfFile={pdfFile} /> : <div /> }
        <Link to="/my-documents">
          <button type="button" className="btn btn-outline-success">
            Back
          </button>
        </Link>
      </div>
    );
  }
}

export default SendApplication;
