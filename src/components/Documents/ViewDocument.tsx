import React, { useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import { LoadingButton, PrimaryButton } from '../BaseComponents/Button';
import DocumentViewer from './DocumentViewer';
import { MailConfirmation, MailModal } from './MailModal';

interface Props {
  alert: any;
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

  const mailForm = async () => {
    const today = new Date();
    const date = `${`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`}' '${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

    const description = `\nUser Role: ${userRole}\n Target User: ${targetUser}\n Document Name: ${documentName}\n Document ID: ${documentId}\n DocumentDate: ${documentDate}\n DocumentUploader: ${documentUploader}\n Submission Date: ${date}`;

    try {
      const response = await fetch(`${getServerURL()}/submit-issue`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'foo@email.com',
          title: 'Mail Submission',
          description,
        }),
      });

      const responseJSON = await response.json();
      const { status } = responseJSON;

      if (status === 'SUCCESS') {
        setMailDialogIsOpen(false);
        setShowMailSuccess(true);
      } else {
        setMailDialogIsOpen(false);
        alert.show('Failed to submit. Please try another time.');
      }
    } catch (error) {
      setMailDialogIsOpen(false);
      alert.show('Failed to submit. Please try again.');
    }
  };

  let fileName = '';
  if (pdfFile) {
    const splitName = pdfFile.name.split('.');
    fileName = splitName[0];
  }

  return (
    <div className="tw-mx-5 tw-my-10 sm:tw-mx-32">
      <div className="tw-flex tw-mt-5">
        <Link to="/my-documents" style={{ textDecoration: 'none' }}>
          <PrimaryButton onClick={resetDocumentId}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.75" stroke="currentColor" className="tw-w-5 tw-h-5 tw-pr-1 tw-inline">
              <path strokeLinecap="square" strokeLinejoin="inherit" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to My Documents
          </PrimaryButton>
        </Link>
        <Link to="/my-documents" style={{ textDecoration: 'none' }}>
          <button type="button" className="tw-flex tw-justify-center tw-bg-white tw-border tw-border-primary tw-rounded-md tw-p-1.5 tw-font-semibold tw-text-primary hover:tw-bg-blue-50 hover:tw-no-underline tw-px-3 tw-font-Inter" onClick={resetDocumentId}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.75" stroke="currentColor" className="tw-w-5 tw-h-5 tw-pr-1 tw-inline">
              <path strokeLinecap="square" strokeLinejoin="inherit" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to My Documents
          </button>
        </Link>

        <button className="tw-p-2 tw-m-2 tw-bg-primary" type="button" onClick={() => setMailDialogIsOpen(true)}>Mail</button>

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

      <MailModal isVisible={mailDialogIsOpen} setIsVisible={setMailDialogIsOpen} mailForm={mailForm} />
      <MailConfirmation isVisible={showMailSuccess} setIsVisible={setShowMailSuccess} />

    </div>
  );
};

export default withAlert()(ViewDocument);
