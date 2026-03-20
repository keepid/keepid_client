import React, { useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
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
  fileType: FileType;
  idCategory?: string;
  clientName?: string;
  viewerRole?: Role;
  onDownloadCurrentDocument: () => void;
  onRequestDeleteCurrentDocument: () => void;
  resetDocumentId: ()=> void;
}

const ViewDocument: React.FC<Props> = ({
  alert,
  userRole,
  documentId,
  documentName,
  documentDate,
  documentUploader,
  targetUser,
  fileType,
  idCategory,
  clientName,
  viewerRole,
  onDownloadCurrentDocument,
  onRequestDeleteCurrentDocument,
  resetDocumentId,
}) => {
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [mailDialogIsOpen, setMailDialogIsOpen] = useState(false);
  const [showMailSuccess, setShowMailSuccess] = useState(false);

  useEffect(() => {
    fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        fileType,
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

  let fileName = '';
  if (pdfFile) {
    fileName = pdfFile.name.replace(/\.pdf$/i, '');
  }

  const isStaffViewer = viewerRole === Role.Worker
    || viewerRole === Role.Admin
    || viewerRole === Role.Director;

  return (
    <div className="tw-mx-5 tw-my-10 sm:tw-mx-32">
      <div className="tw-flex tw-mt-5 tw-space-x-2 ">
        <PrimaryButton onClick={resetDocumentId}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.75" stroke="currentColor" className="tw-w-5 tw-h-5 tw-pr-1 tw-inline tw-align-middle tw-pt-[2px]">
            <path strokeLinecap="square" strokeLinejoin="inherit" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="tw-align-middle">Back to My Documents</span>
        </PrimaryButton>

        <PrimaryButtonSolid onClick={() => setMailDialogIsOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-6 tw-h-6 tw-pr-1 tw-inline tw-align-middle">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="tw-align-middle tw-pt-[1px] tw-pl-1">Mail</span>
        </PrimaryButtonSolid>

        <button
          type="button"
          className="tw-bg-transparent tw-border-0 tw-text-gray-500 hover:tw-text-gray-700 tw-p-0"
          onClick={onDownloadCurrentDocument}
          title="Download"
          aria-label="Download"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0 4-4m-4 4-4-4m8 8H8" />
          </svg>
        </button>

        <button
          type="button"
          className="tw-bg-transparent tw-border-0 tw-text-gray-500 hover:tw-text-red-600 tw-p-0"
          onClick={onRequestDeleteCurrentDocument}
          title="Delete"
          aria-label="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5h6v2m-7 4v7m4-7v7m4-7v7M8 21h8a1 1 0 0 0 1-1V7H7v13a1 1 0 0 0 1 1z" />
          </svg>
        </button>

        {isStaffViewer && (
          <Link
            to={{
              pathname: `/home/notify-client/${targetUser}`,
              state: {
                clientName,
                prefilledIdCategory: idCategory,
              },
            }}
            className="tw-text-gray-500 hover:tw-text-gray-700"
            title="Notify Client"
            aria-label="Notify Client"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8m-8 4h5m-7 6 1.5-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4z" />
            </svg>
          </Link>
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
