import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withAlert } from 'react-alert';
import DocumentViewer from './DocumentViewer';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';

interface Props {
  alert: any,
  userRole: Role,
  documentId: string,
  documentName: string,
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
    const {
      userRole,
      documentId,
      documentName,
      alert,
    } = this.props;
    let pdfType;
    if (userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director) {
      pdfType = PDFType.APPLICATION;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION;
    } else {
      pdfType = undefined;
    }
    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        pdfType,
      }),
    }).then((response) => response.blob())
      .then((response) => {
        const pdfFile = new File([response], documentName, { type: 'application/pdf' });
        this.setState({ pdfFile });
      }).catch((_error) => {
        alert.show('Error Fetching File');
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
          <button type="button" className="btn btn-outline-success">
            Back
          </button>
        </Link>
      </div>
    );
  }
}

export default withAlert()(ViewDocument);
