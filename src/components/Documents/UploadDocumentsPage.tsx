import React, { useEffect, useMemo, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useLocation } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import DocumentsInlineUpload from './DocumentsInlineUpload';

interface Props {
  alert: { show: (msg: string, opts?: { type?: string }) => void };
  userRole: Role;
  viewerRole?: Role;
  username: string;
  viewerUsername?: string;
  viewerName?: string;
  organizationName?: string;
  clientName?: string;
}

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

function UploadDocumentsPage({
  alert,
  userRole,
  viewerRole,
  username,
  viewerUsername,
  viewerName,
  organizationName,
  clientName,
}: Props) {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryInitialCategory = params.get('category') || '';
  const returnTo = params.get('returnTo') || '';
  const queryMode = params.get('mode');
  const returnLink = userRole === Role.Client ? `/my-documents/${username}` : '/my-documents/';
  const isQuickAccessUpload = !!returnTo && queryMode === 'choose';
  const [phoneUploadToken, setPhoneUploadToken] = useState<string | null>(null);
  const [phoneUploadContext, setPhoneUploadContext] = useState<{
    targetUser: string;
    targetClientDisplayName?: string;
    idCategory: string;
    customIdCategory?: string;
    expiresAt?: number;
  } | null>(null);
  const [tokenError, setTokenError] = useState<string>('');
  const [resolvingToken, setResolvingToken] = useState(false);

  useEffect(() => {
    if (!location.hash) return;
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const token = hashParams.get('t');
    if (!token) return;
    setPhoneUploadToken(token);
    if (typeof window !== 'undefined') {
      const cleanUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [location.hash]);

  useEffect(() => {
    if (!phoneUploadToken) return undefined;
    let cancelled = false;
    setResolvingToken(true);
    setTokenError('');
    fetch(`${getServerURL()}/resolve-phone-upload-token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneUploadToken }),
    })
      .then((res) => parseJsonResponseSafe(res))
      .then((json) => {
        if (cancelled) return;
        if (json?.status !== 'SUCCESS' || !json?.phoneUpload?.targetUser) {
          setTokenError(json?.message || 'Phone upload link is invalid or expired.');
          return;
        }
        setPhoneUploadContext({
          targetUser: json.phoneUpload.targetUser,
          targetClientDisplayName: json.phoneUpload.targetClientDisplayName || '',
          idCategory: json.phoneUpload.idCategory || '',
          customIdCategory: json.phoneUpload.customIdCategory || '',
          expiresAt: json.phoneUpload.expiresAt,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setTokenError(`Unable to validate phone upload link: ${err}`);
      })
      .finally(() => {
        if (!cancelled) setResolvingToken(false);
      });
    return () => {
      cancelled = true;
    };
  }, [phoneUploadToken]);

  const targetUser = phoneUploadContext?.targetUser || username;
  const initialCategory = phoneUploadContext?.idCategory || queryInitialCategory;
  const initialCustomCategory = phoneUploadContext?.customIdCategory || '';
  const initialMode = useMemo(() => {
    if (phoneUploadContext) return 'scanning';
    return queryMode === 'scan' ? 'scanning' : undefined;
  }, [phoneUploadContext, queryMode]);

  if (resolvingToken) {
    return (
      <div className="container">
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-6">Preparing secure upload...</h1>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="container">
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-6">Upload link unavailable</h1>
          <p className="text-danger">{tokenError}</p>
          <p className="text-muted mb-0">
            Ask the case worker to generate a new Upload from phone link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Helmet>
        <title>Upload Documents</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron-fluid mt-5">
        {isQuickAccessUpload ? (
          <div className="mb-4">
            <Link to="/" className="btn btn-outline-secondary">
              <i className="fas fa-chevron-left me-1" aria-hidden />
              Back
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
            <h1 className="display-4 mb-0">Upload Documents</h1>
            {phoneUploadToken ? null : (
              <Link to={returnLink} className="btn btn-outline-secondary">
                Back to documents
              </Link>
            )}
          </div>
        )}
        <DocumentsInlineUpload
          targetUser={targetUser}
          alert={alert}
          onUploadComplete={() => {
            if (returnTo) history.push(returnTo);
          }}
          viewerUsername={viewerUsername}
          viewerRole={viewerRole}
          viewerName={viewerName}
          organizationName={organizationName}
          clientName={phoneUploadContext?.targetClientDisplayName || clientName}
          initialMode={initialMode}
          initialCategory={initialCategory}
          initialCustomIdCategory={initialCustomCategory}
          lockedCategory={(isQuickAccessUpload && !!initialCategory) || !!phoneUploadToken}
          forceScannerMode={!!phoneUploadToken}
          phoneUploadToken={phoneUploadToken || undefined}
        />
      </div>
    </div>
  );
}

export default withAlert()(UploadDocumentsPage);
