import React, { useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Role from '../../static/Role';
import { canUseClientNotifications } from '../../utils/featureAccess';
import { PrimaryButton, PrimaryButtonSolid } from '../BaseComponents/Button';
import ApplicationStylePdfViewer from './ApplicationStylePdfViewer';

interface Props {
  alert: any;
  // user role is set to client while viewing documents
  userRole: Role;
  documentId: string;
  documentName: string;
  documentDate: string;
  documentUploader: string;
  documentUploaderName?: string;
  targetUser: string;
  fileType: FileType;
  idCategory?: string;
  idCategoryDisplay?: string;
  customIdCategory?: string;
  clientName?: string;
  viewerRole?: Role;
  organizationName?: string;
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
  documentUploaderName,
  targetUser,
  fileType,
  idCategory,
  idCategoryDisplay,
  customIdCategory,
  clientName,
  viewerRole,
  organizationName,
  onDownloadCurrentDocument,
  onRequestDeleteCurrentDocument,
  resetDocumentId,
}) => {
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);

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

  const documentTypeLabel = (() => {
    const custom = (customIdCategory || '').trim();
    if (custom) return custom;
    const display = (idCategoryDisplay || '').trim();
    if (display && display.toUpperCase() !== 'NONE') return display;
    const normalized = (idCategory || '').trim();
    if (!normalized || normalized.toUpperCase() === 'NONE') return 'Uncategorized';
    if (normalized.includes('_')) {
      return normalized
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return normalized;
  })();

  const isStaffViewer = viewerRole === Role.Worker
    || viewerRole === Role.Admin
    || viewerRole === Role.Director;
  const canNotify = isStaffViewer && canUseClientNotifications(viewerRole, organizationName);

  const uploadedAtLabel = (() => {
    if (!documentDate) return '';
    const parsed = new Date(documentDate);
    if (Number.isNaN(parsed.getTime())) return documentDate;
    return parsed.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  })();

  const uploadedByLabel = (documentUploaderName || '').trim() || documentUploader;

  return (
    <div className="tw-w-full tw-pt-12 sm:tw-pt-16 tw-pb-14 tw-px-4 sm:tw-px-6 lg:tw-px-8">
      <div className="tw-mx-auto tw-w-full tw-max-w-5xl">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
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
          {canNotify && (
            <Link
              to={{
                pathname: `/home/notify-client/${targetUser}`,
                state: {
                  clientName,
                  prefilledIdCategory: documentTypeLabel,
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
          <div className="tw-mt-10 tw-flex tw-flex-col tw-gap-4 lg:tw-mt-12 lg:tw-flex-row lg:tw-items-start lg:tw-justify-between">
            <h1 className="tw-mb-0 tw-text-left tw-text-4xl tw-font-semibold tw-text-gray-900 sm:tw-text-5xl">
              {documentTypeLabel}
            </h1>
            <div className="tw-flex tw-shrink-0 tw-flex-col tw-gap-1 tw-text-sm tw-text-gray-600 lg:tw-items-end lg:tw-text-right lg:tw-text-base">
              {uploadedAtLabel && <div>Uploaded {uploadedAtLabel}</div>}
              {uploadedByLabel && <div>Uploaded by {uploadedByLabel}</div>}
            </div>
          </div>
        ) : null}
        {pdfFile ? (
          <div className="tw-mt-10 lg:tw-mt-12">
            <ApplicationStylePdfViewer pdfFile={pdfFile} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default withAlert()(ViewDocument);
