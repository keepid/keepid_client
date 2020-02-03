import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from './DocumentViewer';

interface Props {
  documentId: string | undefined,
}

interface State {
  pdfFile: File | undefined,
}

class ViewDocument extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      pdfFile: undefined,
    };
    this.printDocument = this.printDocument.bind(this);
  }

  componentDidMount() {
    fetch('http://localhost:7000/download', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    }).then((response) => response.blob())
      .then((response) => {
        const file = new Blob([response], {
          type: 'application/pdf',
        });
        const pdfFile = new File([file], 'Pdf File Name');
        this.setState({ pdfFile });
      });
  }

  printDocument() {
    const {
      pdfFile,
    } = this.state;
  }

  render() {
    const {
      pdfFile,
    } = this.state;
    return (
      <div>
        { pdfFile ? <DocumentViewer pdfFile={pdfFile} /> : <div /> }
        <Link to="/my-documents">
          <button type="button">
            Back
          </button>
        </Link>
        <button onClick={this.printDocument} type="button">Print</button>
      </div>
    );
  }
}

export default ViewDocument;
