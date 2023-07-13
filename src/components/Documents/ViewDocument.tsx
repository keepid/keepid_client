import React, { useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DocumentViewer from './DocumentViewer';

interface Props {
  alert: any;
  userRole: Role;
  documentId: string;
  documentName: string;
  documentDate: string;
  documentUploader: string;
  targetUser: string;
  resetDocumentId: ()=>null;
}

const ViewDocument: React.FC<Props> = ({ alert, userRole, documentId, documentName, documentDate, documentUploader, targetUser, resetDocumentId }) => {
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [showMailForms, setShowMailForms] = useState<boolean>(false);

  useEffect(() => {
    let pdfType;

    if (
      userRole === Role.Worker ||
      userRole === Role.Admin ||
      userRole === Role.Director
    ) {
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
        targetUser,
      }),
    })
      .then((response) => {
        console.log(targetUser);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.blob();
      })
      .then((response) => {
        const pdfFile = new File([response], documentName, {
          type: 'application/pdf',
        });
        setPdfFile(pdfFile);
      })
      .catch((error) => {
        alert.show(`Error Fetching File: ${error.message}`);
      });
  }, [alert, documentId, documentName, userRole, targetUser]); // add props.targetUser in the dependencies array too

  const setLink = () => {
    if (userRole === Role.Client) {
      return '/my-documents';
    }
    return `/my-documents/${targetUser}`;
  };

  const closePopup = () => {
    setShowMailForms(false);
  };

  const onOpenPopup = () => {
    setShowMailForms(true);
  };

  let fileName = '';
  if (pdfFile) {
    const splitName = pdfFile.name.split('.');
    fileName = splitName[0];
  }
  console.log('target user: ', targetUser);
  console.log('document id: ', documentId);
  return (
    <div className="container">
      <div className="mt-5 ml-3">
        <Link to="/my-documents">
          <button type="button" className="btn btn-outline-success" onClick={resetDocumentId}>
            Back
          </button>
        </Link>
      </div>
      {pdfFile ? (
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
      ) : (
        <div />
      )}
      {pdfFile ? <DocumentViewer pdfFile={pdfFile} /> : <div />}

      <div className="mt-5 ml-3">
        <Link to={setLink()}>
          <button type="button" className="btn btn-outline-success" onClick={resetDocumentId}>
            Back
          </button>
        </Link>
      </div>
    </div>
  );
};

export default withAlert()(ViewDocument);
