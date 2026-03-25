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
      <div className="tw-flex tw-items-center tw-justify-between tw-mt-5">
        <PrimaryButton onClick={resetDocumentId}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.75" stroke="currentColor" className="tw-w-5 tw-h-5 tw-pr-1 tw-inline tw-align-middle tw-pt-[2px]">
            <path strokeLinecap="square" strokeLinejoin="inherit" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="tw-align-middle">Back to My Documents</span>
        </PrimaryButton>

        <div className="tw-flex tw-items-center tw-space-x-2">
          <PrimaryButtonSolid onClick={onDownloadCurrentDocument}>
            Download
          </PrimaryButtonSolid>
          <PrimaryButtonSolid onClick={() => setMailDialogIsOpen(true)}>
            Mail
          </PrimaryButtonSolid>
          {isStaffViewer && (
            <Link
              to={{
                pathname: `/home/notify-client/${targetUser}`,
                state: {
                  clientName,
                  prefilledIdCategory: idCategory,
                },
              }}
              className="tw-no-underline"
            >
              <PrimaryButtonSolid onClick={() => {}}>
                Notify
              </PrimaryButtonSolid>
            </Link>
          )}
          <button
            type="button"
            className="tw-flex tw-justify-center tw-bg-white tw-border tw-border-red-500 tw-rounded-md tw-p-1.5 tw-font-semibold tw-text-red-500 hover:tw-bg-red-50 hover:tw-no-underline tw-px-3 tw-font-Inter"
            onClick={onRequestDeleteCurrentDocument}
          >
            Delete
          </button>
        </div>
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
