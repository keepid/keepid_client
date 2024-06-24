import { privateDecrypt } from 'crypto';
import { address } from 'faker';
import React, { useContext, useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';
import { setConstantValue } from 'typescript';

import { UserContext } from '../../App';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import { PrimaryButton, PrimaryButtonSolid } from '../BaseComponents/Button';
import DocumentViewer from './DocumentViewer';
import { MailConfirmation, MailModal } from './MailModal';

interface Props {
  alert: any;
  // user role is set to client while viewing documents
  userRole: Role;
  documentId: string;
  documentName: string;
  documentDate: string;
  documentUploader: string;
  targetUser: string;
  resetDocumentId: ()=> void;
}

const ViewDocument: React.FC<Props> = ({ alert, userRole, documentId, documentName, documentDate, documentUploader, targetUser, resetDocumentId }) => {
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [mailDialogIsOpen, setMailDialogIsOpen] = useState(false);
  const [showMailSuccess, setShowMailSuccess] = useState(false);
  const { username, organization } = useContext(UserContext);

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
  }, [alert, documentId, documentName, userRole, targetUser]);

  const setLink = () => {
    if (userRole === Role.Client) {
      return '/my-documents';
    }
    return `/my-documents/${targetUser}`;
  };

  let fileName = '';
  if (pdfFile) {
    const splitName = pdfFile.name.split('.');
    fileName = splitName[0];
  }

  return (
    <div className="tw-mx-5 tw-my-10 sm:tw-mx-32">
      <div className="tw-flex tw-mt-5 tw-space-x-2 ">
        <Link to="/my-documents" style={{ textDecoration: 'none' }}>
          <PrimaryButton onClick={resetDocumentId}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.75" stroke="currentColor" className="tw-w-5 tw-h-5 tw-pr-1 tw-inline tw-align-middle tw-pt-[2px]">
              <path strokeLinecap="square" strokeLinejoin="inherit" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="tw-align-middle">Back to My Documents</span>
          </PrimaryButton>
        </Link>

        {userRole !== Role.Client && (
<PrimaryButtonSolid onClick={() => setMailDialogIsOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-6 tw-h-6 tw-pr-1 tw-inline tw-align-middle">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="tw-align-middle tw-pt-[1px] tw-pl-1">Mail</span>
</PrimaryButtonSolid>
        )}

      </div>

      {pdfFile ? (
        <div className="">
          <div className="tw-mt-5">
            <h1 className="tw-text-6xl tw-text-left"> {fileName} </h1>
          </div>
          <div className="">
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

      <MailModal
        alert={alert}
        isVisible={mailDialogIsOpen}
        setIsVisible={setMailDialogIsOpen}
        showMailSuccess={showMailSuccess}
        setShowMailSuccess={setShowMailSuccess}
        userRole={userRole}
        targetUser={targetUser}
        documentId={documentId}
        documentUploader={documentUploader}
        documentDate={documentDate}
        documentName={documentName}
      />
      <MailConfirmation isVisible={showMailSuccess} setIsVisible={setShowMailSuccess} />

    </div>
  );
};

export default withAlert()(ViewDocument);
