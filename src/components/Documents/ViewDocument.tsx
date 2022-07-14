import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DocumentViewer from './DocumentViewer';

interface Props {
    alert: any,
    userRole: Role,
    documentId: string,
    documentName: string,
    documentDate: string,
    documentUploader: string,
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
      pdfType = PDFType.COMPLETED_APPLICATION;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION_DOCUMENT;
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
    const {
      documentDate,
      documentUploader,
    } = this.props;
    let fileName = '';
    if (pdfFile) {
      const splitName = pdfFile.name.split('.');
      // eslint-disable-next-line prefer-destructuring
      fileName = splitName[0];
    }
    return (
            <div className="container">
                {pdfFile ?
                  (
                        <div className="jumbotron-fluid">
                            <div className="row justify-content-center mt-5">
                                <h1 className="display-3 text-align-center">
                                    <strong>{fileName}</strong>
                                </h1>
                            </div>
                            <div className="jumbotron-fluid mb-2 ml-5 mr-5">
                                <div className="row justify-content-between">
                                    <h3>{pdfFile.name}</h3>
                                    <div>
                                        <div className="row justify-content-end">
                                            <h6>Uploaded on: {documentDate}</h6>
                                        </div>
                                        <div className="row justify-content-end">
                                            <h6>Uploaded by: {documentUploader}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                  ) : <div />}
                {pdfFile ? <DocumentViewer pdfFile={pdfFile} /> : <div />}
                <div className="mt-5 ml-3">
                    <Link to="/my-documents">
                        <button type="button" className="btn btn-outline-success">
                            Back
                        </button>
                    </Link>
                </div>
            </div>
    );
  }
}

export default withAlert()(ViewDocument);
