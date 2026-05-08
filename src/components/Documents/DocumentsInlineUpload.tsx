import { QRCodeSVG } from 'qrcode.react';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import {
  buildClientDocumentsUrl,
  buildPickupEmailBody,
  buildPickupEmailSubject,
  buildPickupMessage,
  EMPTY_ORG_ADDRESS,
  formatIdLabel,
  isValidEmail,
  isValidUSPhone,
  OrgAddress,
  toE164US,
} from '../Notifications/pickupNotificationTemplate';
import DocumentViewer from './DocumentViewer';
import { IdCategories } from './IdCategories';
import DocumentScanner from './Scanner/DocumentScanner';
import { presetFor } from './Scanner/scannerPresets';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/gif,image/webp';
type Mode = 'picker' | 'scan-pick-category' | 'scanning' | 'upload-pick-file' | 'submit' | 'uploaded-view';

async function parseJsonResponseSafe(response: Response): Promise<any> {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (_err) {
    return {
      status: response.ok ? 'SUCCESS' : 'ERROR',
      message: raw || 'Unexpected response format',
    };
  }
}

export interface DocumentsInlineUploadProps {
  targetUser: string;
  alert: { show: (msg: string, opts?: { type?: string }) => void };
  onUploadComplete: () => void;
  /**
   * Identity of the signed-in user performing the upload. When set to a value
   * different from `targetUser`, the "Upload & notify" button (and its
   * confirmation modal) is shown so staff can send a pickup-ready SMS to the
   * client in the same gesture as uploading. These are optional because the
   * component is also used by clients uploading for themselves, in which case
   * no notification UI is appropriate.
   */
  viewerUsername?: string;
  viewerName?: string;
  organizationName?: string;
  /** Optional client display name, used to pre-fill the templated message. */
  clientName?: string;
  /** Optional starting point for flows that deep-link directly into scanning. */
  initialMode?: Mode;
  initialCategory?: string;
  initialCustomIdCategory?: string;
  forceScannerMode?: boolean;
  phoneUploadToken?: string;
  /**
   * When true, the category is treated as locked for the entire flow: the
   * category selector is hidden, and the upload fires automatically as soon
   * as a file is supplied. Use this for deep links where the caller (e.g.
   * a Quick Access card) already knows exactly what kind of document this
   * is, so the user shouldn't have to re-pick the category.
   *
   * Requires `initialCategory` to be set.
   */
  lockedCategory?: boolean;
  /**
   * My Documents: start with an Upload documents button; opening shows the same
   * dropzone card as the dedicated upload page (click or drag a file).
   */
  collapsible?: boolean;
  /**
   * When set with `collapsible`, rendered on the same row as the upload toggle
   * (e.g. page title left, button right); the expanded upload panel stays below.
   */
  collapsibleHeaderStart?: React.ReactNode;
}

export default function DocumentsInlineUpload({
  targetUser,
  alert,
  onUploadComplete,
  viewerUsername,
  viewerName,
  organizationName,
  clientName: clientNameProp,
  initialMode = 'picker',
  initialCategory = '',
  initialCustomIdCategory = '',
  forceScannerMode = false,
  phoneUploadToken,
  lockedCategory = false,
  collapsible = false,
  collapsibleHeaderStart,
}: DocumentsInlineUploadProps) {
  const detectMobileScannerSupport = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    if (forceScannerMode) return true;
    return window.matchMedia('(max-width: 991px) and (pointer: coarse)').matches;
  }, [forceScannerMode]);
  const [canUseScanner, setCanUseScanner] = useState<boolean>(detectMobileScannerSupport);
  // Compute the initial mode based on the entry point:
  //   - Deep-linked into scan but no category yet → pick category first
  //   - Desktop (no camera scanner): skip the "Choose from photos" picker and
  //     open the file dropzone directly.
  //   - Otherwise → respect whatever the caller asked for.
  const computeStartingMode = (): Mode => {
    if (forceScannerMode) return initialCategory ? 'scanning' : 'scan-pick-category';
    if (initialMode === 'scanning' && !initialCategory) return 'scan-pick-category';
    if (collapsible) return 'picker';
    if (initialMode === 'picker' && !canUseScanner) return 'upload-pick-file';
    return initialMode;
  };
  const startingMode = computeStartingMode();
  const [mode, setMode] = useState<Mode>(startingMode);
  const [expanded, setExpanded] = useState(!collapsible);
  const isOpen = !collapsible || expanded;
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(initialCategory);
  const [customIdCategory, setCustomIdCategory] = useState<string>(initialCustomIdCategory);
  const [uploading, setUploading] = useState(false);

  // Notify flow
  const canNotify = !!viewerUsername && viewerUsername !== targetUser;
  const [showNotifyConfirm, setShowNotifyConfirm] = useState(false);
  const [clientDisplayName, setClientDisplayName] = useState<string>(clientNameProp || '');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [orgAddress, setOrgAddress] = useState<OrgAddress>(EMPTY_ORG_ADDRESS);
  const [notifyHydrated, setNotifyHydrated] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notifyPhoneError, setNotifyPhoneError] = useState('');
  const [creatingPhoneUpload, setCreatingPhoneUpload] = useState(false);
  const [phoneUploadModalOpen, setPhoneUploadModalOpen] = useState(false);
  const [phoneUploadUrl, setPhoneUploadUrl] = useState('');
  const [phoneUploadExpiresAt, setPhoneUploadExpiresAt] = useState<number | null>(null);
  const [phoneUploadError, setPhoneUploadError] = useState('');
  const [phoneUploadStartSeenIds, setPhoneUploadStartSeenIds] = useState<Set<string>>(new Set());
  const [phoneUploadRefreshTick, setPhoneUploadRefreshTick] = useState(0);
  const notifyHydrateStarted = useRef(false);
  const quickPickFileInputRef = useRef<HTMLInputElement>(null);

  const preset = useMemo(() => presetFor(category), [category]);

  const categoryOptions = Object.values(IdCategories);
  const isOtherCategory = category === IdCategories.Other;
  const trimmedCustomIdCategory = customIdCategory.trim();
  const effectiveCategoryLabel = isOtherCategory
    ? trimmedCustomIdCategory
    : category;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    if (collapsible) setExpanded(true);
    setFile(acceptedFiles[0]);
    setMode('submit');
  }, [collapsible]);

  const onQuickPickFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;
    if (collapsible) setExpanded(true);
    setFile(selectedFile);
    setMode('submit');
    input.value = '';
  }, [collapsible]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    maxFiles: 1,
    disabled: uploading || mode !== 'upload-pick-file',
  });

  const fetchCurrentDocumentIds = useCallback(async (): Promise<string[]> => {
    const response = await fetch(`${getServerURL()}/get-files`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileType: FileType.IDENTIFICATION_PDF,
        targetUser,
      }),
    });
    const json = await parseJsonResponseSafe(response);
    const docs = Array.isArray(json?.documents) ? json.documents : [];
    return docs.map((doc: any) => String(doc.id || '')).filter(Boolean);
  }, [targetUser]);

  useEffect(() => {
    const updateScannerAvailability = () => setCanUseScanner(detectMobileScannerSupport());
    updateScannerAvailability();
    window.addEventListener('resize', updateScannerAvailability);
    return () => window.removeEventListener('resize', updateScannerAvailability);
  }, [detectMobileScannerSupport]);

  useEffect(() => {
    if (forceScannerMode) return;
    if (!isOpen) return;
    if (
      !canUseScanner
      && (mode === 'picker' || mode === 'scan-pick-category' || mode === 'scanning')
    ) {
      setMode('upload-pick-file');
    }
  }, [canUseScanner, forceScannerMode, isOpen, mode]);

  useEffect(() => {
    if (!phoneUploadModalOpen) return undefined;
    const intervalId = window.setInterval(() => {
      setPhoneUploadRefreshTick((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [phoneUploadModalOpen]);

  useEffect(() => {
    if (!phoneUploadModalOpen) return undefined;
    const pollIntervalId = window.setInterval(async () => {
      try {
        const latestIds = await fetchCurrentDocumentIds();
        const hasNew = latestIds.some((id) => !phoneUploadStartSeenIds.has(id));
        if (hasNew) {
          setPhoneUploadModalOpen(false);
          alert.show('Phone upload received.');
          onUploadComplete();
        }
      } catch (_err) {
        // Polling is best effort; no toast spam.
      }
    }, 4000);
    return () => window.clearInterval(pollIntervalId);
  }, [alert, fetchCurrentDocumentIds, onUploadComplete, phoneUploadModalOpen, phoneUploadStartSeenIds]);

  // Lazy-hydrate the client phone + org address the first time the notify UI
  // becomes relevant (i.e. on a staff viewer opening the uploader). We don't do
  // this for clients uploading their own documents, and we don't block the
  // regular "Upload" path if this fetch fails.
  useEffect(() => {
    if (!canNotify || !isOpen) return;
    if (notifyHydrateStarted.current) return;
    notifyHydrateStarted.current = true;

    const controller = new AbortController();

    const hydrate = async () => {
      try {
        if (targetUser) {
          const res = await fetch(`${getServerURL()}/get-user-info`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: targetUser }),
            signal: controller.signal,
          });
          const data = await res.json();
          if (data?.status === 'SUCCESS') {
            const fetchedName = [data.firstName, data.lastName]
              .filter(Boolean)
              .join(' ')
              .trim();
            setClientDisplayName((prev) => prev || fetchedName);
            setClientPhone((prev) => prev || (data.phone || ''));
            setClientEmail((prev) => prev || (data.email || ''));
          }
        }

        if (organizationName && organizationName.trim()) {
          const res = await fetch(`${getServerURL()}/get-organization-info`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgName: organizationName }),
            signal: controller.signal,
          });
          const data = await res.json();
          if (data?.status === 'SUCCESS' && data?.orgAddress) {
            const {
              line1 = '', line2 = '', city = '', state = '', zip = '',
            } = data.orgAddress;
            setOrgAddress({
              street: [line1, line2].filter(Boolean).join(', '),
              city,
              state,
              zip,
            });
          }
        }
      } catch (e: any) {
        // Best-effort prefill; silent failure is fine because the user is shown
        // the final templated message in the confirmation modal and can still
        // fall back to the full Notification Center.
      } finally {
        if (!controller.signal.aborted) setNotifyHydrated(true);
      }
    };

    hydrate();
    // eslint-disable-next-line consistent-return
    return () => controller.abort();
  }, [canNotify, isOpen, targetUser, organizationName]);

  const previewMessage = useMemo(
    () => buildPickupMessage({
      clientName: clientDisplayName,
      workerName: viewerName || '',
      idCategory: effectiveCategoryLabel,
      orgAddress,
    }),
    [clientDisplayName, viewerName, effectiveCategoryLabel, orgAddress],
  );

  // Email channel is opt-in: only built when the client has a valid email on
  // file. Subject/body shown in the confirm modal are the same strings sent to
  // the backend so staff see exactly what the client will receive.
  const emailPreview = useMemo(() => {
    if (!isValidEmail(clientEmail)) return null;
    const documentLink = buildClientDocumentsUrl();
    const subject = buildPickupEmailSubject(effectiveCategoryLabel);
    const { text, html } = buildPickupEmailBody({
      clientName: clientDisplayName,
      idCategory: effectiveCategoryLabel,
      organizationName,
      orgAddress,
      clientEmail,
      documentLink,
    });
    return { subject, text, html };
  }, [clientDisplayName, clientEmail, effectiveCategoryLabel, orgAddress, organizationName]);

  const notifyDisabledReason = useMemo(() => {
    if (!canNotify) return '';
    if (!notifyHydrated) return 'Looking up client contact info…';
    if (!clientPhone.trim()) return 'No phone number on file for this client.';
    if (!isValidUSPhone(clientPhone)) return `Phone "${clientPhone}" is not a valid US number.`;
    return '';
  }, [canNotify, notifyHydrated, clientPhone]);
  const canSendNotify = notifyHydrated && !!clientPhone.trim() && isValidUSPhone(clientPhone);
  const getPhoneValidationMessage = () => {
    if (!clientPhone.trim()) {
      return 'Please enter a phone number before sending the notification.';
    }
    return 'Please enter a valid US phone number (for example: 215-555-1234).';
  };

  const notifyPanelPath = `/home/notify-client/${targetUser}`;
  const isTokenDrivenUpload = !!phoneUploadToken;

  const closeTokenSession = useCallback(async () => {
    if (!phoneUploadToken) return;
    try {
      await fetch(`${getServerURL()}/close-phone-upload-session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneUploadToken }),
      });
      alert.show('Phone upload session closed.');
    } catch (_err) {
      alert.show('Unable to close phone upload session.', { type: 'error' });
    }
  }, [alert, phoneUploadToken]);

  const createPhoneUploadSession = useCallback(async () => {
    if (!canNotify) return;
    if (!category) {
      alert.show('Choose a category first.');
      return;
    }
    if (isOtherCategory && !trimmedCustomIdCategory) {
      alert.show('Please specify a custom category for "Other: specify".');
      return;
    }
    setCreatingPhoneUpload(true);
    setPhoneUploadError('');
    try {
      const baselineIds = await fetchCurrentDocumentIds();
      const response = await fetch(`${getServerURL()}/create-phone-upload-session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUser,
          idCategory: category,
          customIdCategory: isOtherCategory ? trimmedCustomIdCategory : undefined,
        }),
      });
      const json = await parseJsonResponseSafe(response);
      if (json?.status !== 'SUCCESS' || !json?.mobileUrl) {
        setPhoneUploadError(json?.message || 'Could not create phone upload session.');
        return;
      }
      setPhoneUploadStartSeenIds(new Set(baselineIds));
      setPhoneUploadUrl(String(json.mobileUrl));
      setPhoneUploadExpiresAt(Number(json.expiresAt || 0));
      setPhoneUploadModalOpen(true);
    } catch (err) {
      setPhoneUploadError(`Could not create phone upload session: ${err}`);
    } finally {
      setCreatingPhoneUpload(false);
    }
  }, [
    alert,
    canNotify,
    category,
    fetchCurrentDocumentIds,
    isOtherCategory,
    targetUser,
    trimmedCustomIdCategory,
  ]);

  const goToEntryMode = useCallback(() => {
    if (forceScannerMode) {
      setMode(category && preset ? 'scanning' : 'scan-pick-category');
      return;
    }
    setMode(canUseScanner ? 'picker' : 'upload-pick-file');
  }, [canUseScanner, category, forceScannerMode, preset]);

  const resetAll = useCallback(() => {
    setFile(null);
    setCategory('');
    setCustomIdCategory(initialCustomIdCategory);
    goToEntryMode();
    if (collapsible) setExpanded(false);
  }, [collapsible, goToEntryMode, initialCustomIdCategory]);

  // Uploads the file and returns whether the upload succeeded. The success
  // toast / reset is intentionally deferred to the caller because the
  // "Upload & notify" path wants to delay cleanup until the SMS is sent too.
  const uploadFile = useCallback(async (): Promise<boolean> => {
    if (!file) {
      alert.show('Choose a file to upload.');
      return false;
    }
    if (!category) {
      alert.show('Please choose a category.');
      return false;
    }
    if (isOtherCategory && !trimmedCustomIdCategory) {
      alert.show('Please specify a custom category for "Other: specify".');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('idCategory', category);
      if (isOtherCategory) {
        formData.append('customIdCategory', trimmedCustomIdCategory);
      }
      formData.append('fileType', FileType.IDENTIFICATION_PDF);
      if (isTokenDrivenUpload && phoneUploadToken) {
        formData.append('phoneUploadToken', phoneUploadToken);
      } else {
        formData.append('targetUser', targetUser);
      }

      const endpoint = isTokenDrivenUpload ? '/upload-file-with-token' : '/upload-file';
      const response = await fetch(`${getServerURL()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: formData,
      });
      const responseJSON = await parseJsonResponseSafe(response);
      if (responseJSON?.status === 'SUCCESS') {
        return true;
      }
      alert.show(`Failed to upload ${file.name}`, { type: 'error' });
      return false;
    } catch (e) {
      alert.show(`Upload failed: ${e instanceof Error ? e.message : String(e)}`, {
        type: 'error',
      });
      return false;
    }
  }, [
    alert,
    category,
    file,
    isOtherCategory,
    isTokenDrivenUpload,
    phoneUploadToken,
    targetUser,
    trimmedCustomIdCategory,
  ]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    try {
      const ok = await uploadFile();
      if (!ok) return;
      if (isTokenDrivenUpload) {
        alert.show('Document uploaded successfully.');
        setMode('uploaded-view');
        return;
      }
      alert.show('Document uploaded successfully.');
      resetAll();
      queueMicrotask(() => {
        onUploadComplete();
      });
    } finally {
      setUploading(false);
    }
  }, [alert, isTokenDrivenUpload, onUploadComplete, resetAll, uploadFile]);

  // Quick Access deep links pre-set the category and don't want the user to
  // confirm it again — as soon as a file is in hand, kick off the upload. We
  // skip "Other: specify" because that path always needs the custom label.
  const autoUploadFiredRef = useRef(false);
  useEffect(() => {
    if (!lockedCategory) return;
    if (mode !== 'submit') return;
    if (uploading) return;
    if (!file || !category || isOtherCategory) return;
    if (autoUploadFiredRef.current) return;
    autoUploadFiredRef.current = true;
    handleUpload();
  }, [lockedCategory, mode, uploading, file, category, isOtherCategory, handleUpload]);

  const handleUploadAndNotify = useCallback(async () => {
    if (!canNotify) return;
    if (!canSendNotify) {
      setNotifyPhoneError(getPhoneValidationMessage());
      return;
    }

    setSendingNotification(true);
    setUploading(true);
    try {
      const uploaded = await uploadFile();
      if (!uploaded) return;

      try {
        const res = await fetch(`${getServerURL()}/notify-id-pickup`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerUsername: viewerUsername,
            clientUsername: targetUser,
            idToPickup: formatIdLabel(effectiveCategoryLabel),
            clientPhoneNumber: toE164US(clientPhone),
            message: previewMessage,
            ...(emailPreview
              ? {
                clientEmail,
                emailSubject: emailPreview.subject,
                emailBody: emailPreview.text,
                emailHtml: emailPreview.html,
              }
              : {}),
          }),
        });
        const data = await res.json().catch(() => ({} as any));
        if (res.ok && data?.status === 'SUCCESS') {
          alert.show(
            emailPreview
              ? 'Document uploaded. SMS + email sent to client.'
              : 'Document uploaded. Notification sent to client.',
          );
        } else {
          // Upload still succeeded; surface the notify failure separately so
          // staff know the doc is saved and they can retry the SMS from the
          // Notification Center.
          alert.show(
            `Document uploaded, but the notification failed${
              data?.message ? `: ${data.message}` : '.'
            } You can retry from the Notification Center.`,
            { type: 'error' },
          );
        }
      } catch (err) {
        alert.show(
          `Document uploaded, but the notification request failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
          { type: 'error' },
        );
      }

      setShowNotifyConfirm(false);
      setNotifyPhoneError('');
      resetAll();
      queueMicrotask(() => {
        onUploadComplete();
      });
    } finally {
      setSendingNotification(false);
      setUploading(false);
    }
  }, [
    alert,
    canNotify,
    category,
    canSendNotify,
    clientEmail,
    clientPhone,
    effectiveCategoryLabel,
    emailPreview,
    notifyDisabledReason,
    onUploadComplete,
    previewMessage,
    resetAll,
    targetUser,
    uploadFile,
    viewerUsername,
    getPhoneValidationMessage,
  ]);

  const toggleButton = collapsible ? (
    <button
      type="button"
      className="btn btn-primary fs-5 px-3 py-2"
      onClick={() => {
        if (expanded) {
          resetAll();
        } else {
          setExpanded(true);
          setMode(canUseScanner ? 'picker' : 'upload-pick-file');
        }
      }}
      disabled={uploading}
    >
      {expanded ? 'Close' : 'Upload documents'}
    </button>
  ) : null;

  const inlinePanelClassName = mode === 'scanning'
    ? `w-100 bg-dark overflow-hidden${collapsible ? ' mt-3' : ''}`
    : `w-100 border rounded p-4 bg-light${collapsible ? ' mt-3' : ''}`;

  return (
    <div
      className={collapsible ? 'w-100' : undefined}
      style={collapsible ? undefined : { display: 'contents' }}
    >
      {collapsible && (
        <div
          className={`d-flex flex-wrap align-items-center gap-2 w-100 ${
            collapsibleHeaderStart ? 'justify-content-between' : 'justify-content-end'
          }`}
        >
          {collapsibleHeaderStart}
          {toggleButton}
        </div>
      )}
      <input
        ref={quickPickFileInputRef}
        type="file"
        accept={ACCEPT}
        className="d-none"
        onChange={onQuickPickFile}
      />
      {isOpen && (
      <div
        className={inlinePanelClassName}
      >
        {mode === 'picker' && (
          <div className="d-flex flex-column gap-3">
            <h5 className="mb-0">
              {lockedCategory && category ? `Add your ${category}` : 'Add this document'}
            </h5>
            <div className="d-flex flex-wrap gap-3">
              {canUseScanner && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg flex-grow-1"
                  onClick={() => setMode(category && preset ? 'scanning' : 'scan-pick-category')}
                  disabled={uploading}
                >
                  Scan with camera
                </button>
              )}
              <button
                type="button"
                className={`${canUseScanner ? 'btn btn-outline-primary' : 'btn btn-primary'} btn-lg flex-grow-1`}
                onClick={() => {
                  setMode('upload-pick-file');
                  quickPickFileInputRef.current?.click();
                }}
                disabled={uploading}
              >
                Choose from photos
              </button>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
                  setMode('upload-pick-file');
                }}
                disabled={uploading}
              >
                Browse or drag a file instead
              </button>
            </div>
          </div>
        )}

        {mode === 'scan-pick-category' && canUseScanner && (
          <div className="d-flex flex-column gap-3">
            <h5 className="mb-0">What are you scanning?</h5>
            <select
              className="form-select form-select-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Document category"
            >
              <option value="">Select category…</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {isOtherCategory && (
              <input
                type="text"
                className="form-control form-control-lg"
                value={customIdCategory}
                onChange={(e) => setCustomIdCategory(e.target.value)}
                placeholder="Enter document type"
                aria-label="Custom document type"
              />
            )}
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setMode('picker')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setMode('scanning')}
                disabled={!preset || (isOtherCategory && !trimmedCustomIdCategory)}
              >
                Start scanning
              </button>
            </div>
          </div>
        )}

        {mode === 'scanning' && preset && (
          <DocumentScanner
            preset={preset}
            filenameHint={category ? category.replace(/[^a-z0-9]+/gi, '_').toLowerCase() : 'scan'}
            onComplete={(built) => {
              setFile(built);
              setMode('submit');
            }}
            onCancel={() => (category ? goToEntryMode() : setMode('scan-pick-category'))}
          />
        )}

        {mode === 'upload-pick-file' && (
          <div className="d-flex flex-column gap-3">
            {canNotify && !isTokenDrivenUpload && (
              <div className="border rounded bg-white p-3">
                <label htmlFor="phone-upload-category" className="form-label fw-semibold">
                  Send scanner link to phone
                </label>
                <select
                  id="phone-upload-category"
                  className="form-select mb-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category…</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {isOtherCategory && (
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={customIdCategory}
                    onChange={(e) => setCustomIdCategory(e.target.value)}
                    placeholder="Enter document type"
                    aria-label="Custom document type"
                  />
                )}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={createPhoneUploadSession}
                  disabled={creatingPhoneUpload || !category || (isOtherCategory && !trimmedCustomIdCategory)}
                >
                  {creatingPhoneUpload ? 'Creating link…' : 'Upload from phone'}
                </button>
                {phoneUploadError ? <div className="text-danger small mt-2">{phoneUploadError}</div> : null}
              </div>
            )}
            {canNotify && !isTokenDrivenUpload && (
              <div className="text-center text-muted fw-semibold text-uppercase small">or</div>
            )}
            <div
              {...getRootProps()}
              className={`d-flex flex-column align-items-center justify-content-center border border-2 rounded p-4 bg-white ${
                isDragActive ? 'border-primary' : 'border-secondary'
              }`}
              style={{ minHeight: 140, cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              <input {...getInputProps()} />
              <p className="mb-2 text-center fs-5 fw-medium">
                {isDragActive ? 'Drop file here' : 'Click here to upload'}
              </p>
              <p className="mb-0 text-muted fs-6 text-center">PDF or image · one file</p>
            </div>
            {/*
              Back returns to scan vs. upload on mobile; desktop has no picker
              step, so there is nothing to go back to.
            */}
            {canUseScanner && (
              <div className="d-flex flex-wrap gap-2 justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={goToEntryMode}
                >
                  Back
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'submit' && file && (
          <div className="d-flex flex-column gap-3">
            <h5 className="mb-0">
              {lockedCategory ? `Uploading ${category}` : 'Categorize and upload'}
            </h5>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span
                className="fs-5 fw-medium text-break flex-grow-1"
                style={{ minWidth: '8rem' }}
                title={file.name}
              >
                {file.name}
              </span>
              {!lockedCategory && (
                <select
                  id="inline-upload-category"
                  className="form-select fs-5"
                  style={{ width: 'auto', minWidth: '16rem', maxWidth: '24rem' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={uploading}
                  aria-label="Document category"
                >
                  <option value="">Select category…</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              {!lockedCategory && isOtherCategory && (
                <input
                  type="text"
                  className="form-control fs-5"
                  style={{ width: 'auto', minWidth: '16rem', maxWidth: '24rem' }}
                  value={customIdCategory}
                  onChange={(e) => setCustomIdCategory(e.target.value)}
                  placeholder="Enter document type"
                  disabled={uploading}
                  aria-label="Custom document type"
                />
              )}
              <button
                type="button"
                className="btn btn-link fs-5 text-decoration-none p-0 align-self-center"
                onClick={() => {
                  setFile(null);
                  autoUploadFiredRef.current = false;
                  goToEntryMode();
                }}
                disabled={uploading}
              >
                {lockedCategory ? 'Use a different file' : 'Remove'}
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-primary btn-lg fs-5"
                onClick={handleUpload}
                disabled={uploading || !file || !category || (isOtherCategory && !trimmedCustomIdCategory)}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              {canNotify && (
                <button
                  type="button"
                  className="btn btn-success btn-lg fs-5"
                  onClick={() => {
                    setNotifyPhoneError('');
                    setShowNotifyConfirm(true);
                  }}
                  disabled={uploading || !file || !category || (isOtherCategory && !trimmedCustomIdCategory)}
                  title={
                    notifyDisabledReason
                      || 'Upload the document and text the client that it is ready for pickup.'
                  }
                >
                  Upload & notify
                </button>
              )}
              {isTokenDrivenUpload && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg fs-5"
                  onClick={closeTokenSession}
                  disabled={uploading}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}

        {mode === 'uploaded-view' && file && (
          <div className="d-flex flex-column gap-3">
            <h5 className="mb-0">Uploaded document</h5>
            <div className="border rounded bg-light p-3">
              <div className="small text-muted">Client</div>
              <div className="fw-semibold mb-2">{clientNameProp || targetUser}</div>
              <div className="small text-muted">Document type</div>
              <div className="fw-semibold">{effectiveCategoryLabel || category || 'Uncategorized'}</div>
            </div>
            <DocumentViewer pdfFile={file} readOnly />
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-primary btn-lg fs-5"
                onClick={() => {
                  setFile(null);
                  goToEntryMode();
                }}
              >
                Upload another
              </button>
              {isTokenDrivenUpload && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg fs-5"
                  onClick={closeTokenSession}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      )}
      {phoneUploadModalOpen && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-upload-title"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPhoneUploadModalOpen(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title mb-0" id="phone-upload-title">
                  Upload from phone
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setPhoneUploadModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  A text message was sent to your phone with a secure upload link.
                </p>
                {phoneUploadExpiresAt ? (
                  <p className="small text-muted mb-3">
                    Expires in{' '}
                    {Math.max(0, Math.floor((phoneUploadExpiresAt - Date.now()) / 1000 / 60))}
                    {' '}
                    min
                  </p>
                ) : null}
                <div className="d-flex justify-content-center mb-3">
                  <QRCodeSVG value={phoneUploadUrl} size={220} />
                </div>
                <div className="input-group">
                  <input className="form-control" type="text" readOnly value={phoneUploadUrl} />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(phoneUploadUrl);
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p className="small text-muted mt-3 mb-0">
                  Waiting for upload... this window auto-refreshes every few seconds.
                </p>
                <span className="d-none">{phoneUploadRefreshTick}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showNotifyConfirm && canNotify && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notify-confirm-title"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !sendingNotification) {
              setShowNotifyConfirm(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title mb-0" id="notify-confirm-title">
                  Send pickup notification?
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setNotifyPhoneError('');
                    setShowNotifyConfirm(false);
                  }}
                  disabled={sendingNotification}
                />
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  This will upload the document and text{' '}
                  <strong>{clientDisplayName || targetUser}</strong>
                  {clientPhone ? (
                    <>
                      {' '}at <strong>{clientPhone}</strong>
                    </>
                  ) : null}
                  {' '}with the following message:
                </p>
                <div className="mb-3">
                  <label htmlFor="notify-phone-input" className="form-label mb-1">Telephone</label>
                  <input
                    id="notify-phone-input"
                    type="tel"
                    className="form-control"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      if (notifyPhoneError) setNotifyPhoneError('');
                    }}
                    placeholder="e.g. 215-555-1234"
                    disabled={sendingNotification}
                  />
                </div>
                <div
                  className="border rounded bg-light p-3 mb-3 text-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {previewMessage}
                </div>
                {emailPreview ? (
                  <div className="mb-3">
                    <p className="small text-muted mb-1">
                      Will also email <strong>{clientEmail}</strong>
                    </p>
                    <div className="border rounded bg-light p-3">
                      <p className="fw-semibold mb-2">{emailPreview.subject}</p>
                      <p
                        className="mb-0 small"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {emailPreview.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="small text-muted mb-3">
                    {clientEmail
                      ? `Email "${clientEmail}" looks invalid; only an SMS will be sent.`
                      : 'No email on file for this client. Only an SMS will be sent.'}
                  </p>
                )}
                <p className="small text-muted mb-0">
                  A copy is saved in this client&apos;s{' '}
                  <Link to={notifyPanelPath} onClick={() => setShowNotifyConfirm(false)}>
                    notification history
                  </Link>.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setNotifyPhoneError('');
                    setShowNotifyConfirm(false);
                  }}
                  disabled={sendingNotification}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={canSendNotify ? 'btn btn-success' : 'btn btn-secondary'}
                  onClick={() => {
                    if (!canSendNotify) {
                      setNotifyPhoneError(getPhoneValidationMessage());
                      return;
                    }
                    handleUploadAndNotify();
                  }}
                  disabled={sendingNotification || !canSendNotify}
                >
                  {sendingNotification ? 'Sending…' : 'Yes, upload & notify'}
                </button>
                {notifyPhoneError && (
                  <div className="w-100 text-danger small mt-1">{notifyPhoneError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
