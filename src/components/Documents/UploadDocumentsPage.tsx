import React from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useLocation } from 'react-router-dom';

import Role from '../../static/Role';
import DocumentsInlineUpload from './DocumentsInlineUpload';

interface Props {
  alert: { show: (msg: string, opts?: { type?: string }) => void };
  userRole: Role;
  username: string;
  viewerUsername?: string;
  viewerName?: string;
  organizationName?: string;
  clientName?: string;
}

function UploadDocumentsPage({
  alert,
  userRole,
  username,
  viewerUsername,
  viewerName,
  organizationName,
  clientName,
}: Props) {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('category') || '';
  const returnTo = params.get('returnTo') || '';
  const mode = params.get('mode');
  const initialMode = mode === 'scan' ? 'scanning' : undefined;
  const returnLink = userRole === Role.Client ? `/my-documents/${username}` : '/my-documents/';
  const isQuickAccessUpload = !!returnTo && mode === 'choose';

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
            <Link to={returnLink} className="btn btn-outline-secondary">
              Back to documents
            </Link>
          </div>
        )}
        <DocumentsInlineUpload
          targetUser={username}
          alert={alert}
          onUploadComplete={() => {
            if (returnTo) history.push(returnTo);
          }}
          viewerUsername={viewerUsername}
          viewerName={viewerName}
          organizationName={organizationName}
          clientName={clientName}
          initialMode={initialMode}
          initialCategory={initialCategory}
          lockedCategory={isQuickAccessUpload && !!initialCategory}
        />
      </div>
    </div>
  );
}

export default withAlert()(UploadDocumentsPage);
