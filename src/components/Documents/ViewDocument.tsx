import React, { useEffect, useState } from 'react';
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
}

interface State {
  pdfFile: File | undefined,
}

const ViewDocument = ({ alert, userRole, documentId, documentName }: Props) => {
  const [pdfFile, setPDFFile] = useState<State['pdfFile']>(undefined);
  useEffect(() => {
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
        setPDFFile(pdfFile);
      }).catch((_error) => {
        alert.show('Error Fetching File');
      });
  }, []);

  return (
    <div>
      {pdfFile ? <DocumentViewer pdfFile={pdfFile} /> : <div />}
      <Link to="/my-documents">
        <button type="button" className="btn btn-outline-success">
          Back
        </button>
      </Link>
    </div>
  );
};

export default withAlert()(ViewDocument);
