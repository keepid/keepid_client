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
      </div>
    );
  }
}

export default ViewDocument;
