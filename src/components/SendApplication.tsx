import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from './DocumentViewer';
import getServerURL from '../serverOverride';

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
