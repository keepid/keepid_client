import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAlert } from 'react-alert';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useLocation } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import { MailConfirmation, MailModal } from '../Documents/MailModal';
import SignAndDownloadViewer, { SignAndDownloadViewerHandle } from '../InteractiveForms/SignAndDownloadViewer';

interface PreviewLocationState {
  applicationId?: string;
  applicationFilename?: string;
  clientUsername?: string;
  targetUser?: string;
}

export default function ApplicationPdfPreview({
  editable = false,
  allowAttachmentEditing = false,
}: {
  editable?: boolean;
  allowAttachmentEditing?: boolean;
}) {
  const location = useLocation<PreviewLocationState>();
  const history = useHistory();
  const alert = useAlert();

  const applicationId = location.state?.applicationId || '';
  const applicationFilename = location.state?.applicationFilename || 'application-preview.pdf';
  const clientUsername = location.state?.clientUsername || '';
  const targetUser = location.state?.targetUser || '';
  const editTargetUsername = targetUser || clientUsername;
  const canEditAttachments = editable && allowAttachmentEditing;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(editable);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [mailDialogIsOpen, setMailDialogIsOpen] = useState(false);
  const [showMailSuccess, setShowMailSuccess] = useState(false);
  const viewerRef = useRef<SignAndDownloadViewerHandle>(null);
  const goToPreviewRoute = () => {
    history.replace({
      pathname: '/applications/preview',
      state: {
        applicationId,
        applicationFilename,
        targetUser,
        clientUsername,
      },
    });
  };

  useEffect(() => {
    if (editable) {
      setIsEditMode(true);
    }
  }, [editable]);

  useEffect(() => {
    if (!applicationId) {
      setError('No application selected. Please return to Applications and choose one.');
      return () => {};
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      body: JSON.stringify({
        fileId: applicationId,
        fileType: FileType.APPLICATION_PDF,
        targetUser: editTargetUsername || undefined,
      }),
    })
      .then(async (response) => {
        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || '';
        const looksTextual = contentType.includes('json') || contentType.includes('text');

        if (looksTextual) {
          const bodyText = await blob.text();
          const parsed = (() => {
            try {
              return JSON.parse(bodyText);
            } catch {
              return null;
            }
          })();
          if (!response.ok) {
            throw new Error(parsed?.message || 'Could not load application PDF.');
          }
          if (parsed?.status && parsed.status !== 'SUCCESS') {
            throw new Error(parsed?.message || parsed.status || 'Could not load application PDF.');
          }
          // If a textual body wasn't a structured error, continue with the original payload.
          return blob;
        }

        if (!response.ok) {
          throw new Error('Could not load application PDF.');
        }

        return blob;
      })
      .then((blob) => {
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      })
      .catch((fetchError) => {
        if (fetchError?.name !== 'AbortError') {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load application PDF.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [applicationId, editTargetUsername]);

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  const previewTitle = useMemo(() => applicationFilename.replace(/\.pdf$/i, ''), [applicationFilename]);

  return (
    <div className="tw-w-full tw-pt-10 tw-px-4 sm:tw-px-6 lg:tw-px-8">
      <Helmet>
        <title>Application Preview</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      <div className="tw-mx-auto tw-w-full tw-max-w-4xl">
        <div className="tw-mb-4 tw-flex tw-items-center tw-justify-between tw-gap-2">
          <div>
            <Button
              variant="outline-primary"
              onClick={() => history.push('/applications')}
            >
              Back to Applications
            </Button>
            {!applicationId && (
              <Link to="/applications" className="tw-ml-2">
                <Button variant="primary">Go to Applications</Button>
              </Link>
            )}
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            {applicationId && (
              <Button variant="primary" onClick={() => setMailDialogIsOpen(true)}>
                Mail
              </Button>
            )}
            {applicationId && !editable && (
              <Link
                to={{
                  pathname: '/applications/edit',
                  state: {
                    applicationId,
                    applicationFilename,
                    targetUser,
                    clientUsername,
                  },
                }}
              >
                <Button variant="primary">Edit PDF</Button>
              </Link>
            )}
            {applicationId && editable && !isEditMode && (
              <Button
                variant="primary"
                onClick={() => setIsEditMode(true)}
              >
                Edit PDF
              </Button>
            )}
            {applicationId && editable && isEditMode && (
              <>
                <Button
                  variant="success"
                  disabled={isSavingEdits}
                  onClick={async () => {
                    if (!viewerRef.current) return;
                    setIsSavingEdits(true);
                    const success = await viewerRef.current.savePdfEdits();
                    setIsSavingEdits(false);
                    if (success) goToPreviewRoute();
                  }}
                >
                  {isSavingEdits ? 'Saving changes...' : 'Save changes'}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    viewerRef.current?.discardPdfEdits();
                    goToPreviewRoute();
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading PDF preview...</span>
            </Spinner>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && !error && pdfUrl && (
          <SignAndDownloadViewer
            ref={viewerRef}
            fileUrl={pdfUrl}
            signaturePlacements={[]}
            title={previewTitle}
            applicationId={applicationId}
            formAnswers={{}}
            clientUsername={editTargetUsername}
            showSaveButton={false}
            showPdfEditControls={false}
            pdfFormsReadOnly={!editable || !isEditMode}
            canEditAttachments={canEditAttachments}
          />
        )}
      </div>

      <MailModal
        alert={alert}
        isVisible={mailDialogIsOpen}
        setIsVisible={setMailDialogIsOpen}
        showMailSuccess={showMailSuccess}
        setShowMailSuccess={setShowMailSuccess}
        userRole=""
        targetUser={editTargetUsername}
        documentId={applicationId}
        documentUploader=""
        documentDate=""
        documentName={applicationFilename}
      />
      <MailConfirmation isVisible={showMailSuccess} setIsVisible={setShowMailSuccess} />
    </div>
  );
}
