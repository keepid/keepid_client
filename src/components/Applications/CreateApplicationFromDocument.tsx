import AddIcon from '@mui/icons-material/Add';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import {
  createApplicationFromDocument,
  createUploadedApplication,
  listOrgDocuments,
  OrgDocumentOption,
} from './api/interactiveForm';

interface ClientSearchResult {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface LocationState {
  clientUsername?: string;
  clientName?: string;
}

interface Props {
  userRole: Role;
  viewerName: string;
  viewerUsername: string;
}

type SourceType = 'upload' | 'org';

const MAX_CLIENT_RESULTS = 25;

function getClientDisplayName(client: ClientSearchResult): string {
  return `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.username;
}

function getOrgDocumentApplicationName(doc: OrgDocumentOption): string {
  return doc.filename
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function SourceCard({
  title,
  description,
  icon,
  selected,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`tw-w-full tw-min-h-[8.5rem] tw-rounded-lg tw-border tw-bg-white tw-p-5 tw-text-left tw-shadow-sm tw-transition-all ${
        selected
          ? 'tw-border-twprimary tw-bg-blue-50 tw-shadow-md'
          : 'tw-border-gray-200 hover:tw-border-blue-300 hover:tw-bg-blue-50 hover:tw-shadow-md'
      } ${disabled ? 'tw-cursor-not-allowed tw-opacity-60 hover:tw-border-gray-200 hover:tw-bg-white hover:tw-shadow-sm' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="tw-flex tw-items-center tw-gap-4">
        <span className="tw-flex tw-h-16 tw-w-16 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-blue-100 tw-bg-blue-50 tw-text-twprimary">
          {icon}
        </span>
        <span className="tw-min-w-0 tw-flex-1">
          <span className="tw-block tw-text-lg tw-font-semibold tw-leading-snug tw-text-gray-900">
            {title}
          </span>
          <span className="tw-mt-1 tw-block tw-text-sm tw-leading-snug tw-text-gray-600">
            {description}
          </span>
        </span>
        <ChevronRightIcon className="tw-shrink-0 tw-text-gray-400" />
      </span>
    </button>
  );
}

export default function CreateApplicationFromDocument({
  userRole,
  viewerName,
  viewerUsername,
}: Props) {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const initialClientUsername = location.state?.clientUsername || '';
  const initialClientName = location.state?.clientName || initialClientUsername;
  const [step, setStep] = useState<'client' | 'source'>(initialClientUsername ? 'source' : 'client');
  const [clientUsername, setClientUsername] = useState(initialClientUsername);
  const [clientName, setClientName] = useState(initialClientName);
  const [clientQuery, setClientQuery] = useState(initialClientName);
  const [clientResults, setClientResults] = useState<ClientSearchResult[]>([]);
  const [clientResultsOpen, setClientResultsOpen] = useState(false);
  const [clientSearching, setClientSearching] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [orgDocuments, setOrgDocuments] = useState<OrgDocumentOption[]>([]);
  const [isLoadingOrgDocuments, setIsLoadingOrgDocuments] = useState(false);
  const [orgDocumentsError, setOrgDocumentsError] = useState<string | null>(null);
  const [uploadApplicationName, setUploadApplicationName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [orgApplicationName, setOrgApplicationName] = useState('');
  const [orgSourceDocumentId, setOrgSourceDocumentId] = useState('');
  const [orgSubmitting, setOrgSubmitting] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const clientSearchRequestIdRef = useRef(0);

  useEffect(() => {
    setIsLoadingOrgDocuments(true);
    setOrgDocumentsError(null);
    listOrgDocuments()
      .then((documents) => setOrgDocuments(documents))
      .catch(() => {
        setOrgDocuments([]);
        setOrgDocumentsError('Could not load organization documents.');
      })
      .finally(() => setIsLoadingOrgDocuments(false));
  }, []);

  const selectedClientLabel = clientName || clientUsername;

  const returnToApplications = useCallback(() => {
    history.push({
      pathname: '/applications',
      state: clientUsername
        ? {
          clientUsername,
          clientName,
        }
        : undefined,
    });
  }, [clientName, clientUsername, history]);

  const navigateToCreatedApplication = useCallback((
    applicationId: string,
    applicationName: string,
  ) => {
    history.push({
      pathname: '/applications/preview',
      state: {
        applicationId,
        applicationFilename: `${applicationName}.pdf`,
        targetUser: clientUsername,
        clientUsername,
        applicantName: selectedClientLabel,
        uploadedByName: viewerName || viewerUsername,
        createdDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString(),
      },
    });
  }, [clientUsername, history, selectedClientLabel, viewerName, viewerUsername]);

  const searchClients = (query: string) => {
    const trimmedQuery = query.trim();
    setClientQuery(query);
    setClientUsername('');
    setClientName('');
    setClientResultsOpen(true);
    setClientError(null);
    if (trimmedQuery.length < 2) {
      setClientResults([]);
      setClientSearching(false);
      return;
    }

    const requestId = clientSearchRequestIdRef.current + 1;
    clientSearchRequestIdRef.current = requestId;
    setClientSearching(true);
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        role: userRole,
        listType: 'clients',
        name: trimmedQuery,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (clientSearchRequestIdRef.current !== requestId) return;
        if (responseJSON.status === 'SUCCESS' && Array.isArray(responseJSON.people)) {
          setClientResults(responseJSON.people.slice(0, MAX_CLIENT_RESULTS));
          setClientSearching(false);
          return;
        }
        setClientResults([]);
        setClientSearching(false);
        setClientError(responseJSON.status && responseJSON.status !== 'USER_NOT_FOUND'
          ? 'Could not load client search results.'
          : null);
      })
      .catch(() => {
        if (clientSearchRequestIdRef.current !== requestId) return;
        setClientResults([]);
        setClientSearching(false);
        setClientError('Could not load client search results.');
      });
  };

  const selectClient = (client: ClientSearchResult) => {
    const displayName = getClientDisplayName(client);
    setClientUsername(client.username);
    setClientName(displayName);
    setClientQuery(displayName);
    setClientResults([]);
    setClientResultsOpen(false);
    setClientError(null);
  };

  const resetSourceErrors = () => {
    setUploadError(null);
    setOrgError(null);
  };

  const chooseSource = (source: SourceType) => {
    setSourceType(source);
    resetSourceErrors();
  };

  const handleOrgDocumentSelection = (sourceDocumentId: string) => {
    const selected = orgDocuments.find((doc) => doc.id === sourceDocumentId);
    setOrgSourceDocumentId(sourceDocumentId);
    setOrgApplicationName(selected ? getOrgDocumentApplicationName(selected) : '');
    setOrgError(null);
  };

  const handleUploadApplication = async () => {
    const trimmedName = uploadApplicationName.trim();
    if (!clientUsername) {
      setUploadError('Choose the client this application is for.');
      return;
    }
    if (!trimmedName || !uploadFile) {
      setUploadError('Enter an application name and choose a PDF.');
      return;
    }
    setUploadSubmitting(true);
    setUploadError(null);
    try {
      const result = await createUploadedApplication(uploadFile, trimmedName, clientUsername);
      const applicationId = result.applicationId || result.fileId;
      if (!applicationId) throw new Error('Server did not return an application id.');
      navigateToCreatedApplication(applicationId, trimmedName);
    } catch (error) {
      setUploadSubmitting(false);
      setUploadError(error instanceof Error ? error.message : 'Could not upload application.');
    }
  };

  const handleCreateFromOrgDocument = async () => {
    const trimmedName = orgApplicationName.trim();
    if (!clientUsername) {
      setOrgError('Choose the client this application is for.');
      return;
    }
    if (!trimmedName || !orgSourceDocumentId) {
      setOrgError('Enter an application name and choose an org document.');
      return;
    }
    setOrgSubmitting(true);
    setOrgError(null);
    try {
      const result = await createApplicationFromDocument(orgSourceDocumentId, trimmedName, clientUsername);
      const applicationId = result.applicationId || result.fileId;
      if (!applicationId) throw new Error('Server did not return an application id.');
      navigateToCreatedApplication(applicationId, trimmedName);
    } catch (error) {
      setOrgSubmitting(false);
      setOrgError(error instanceof Error ? error.message : 'Could not create application.');
    }
  };

  const orgDocumentDescription = useMemo(() => {
    if (isLoadingOrgDocuments) return 'Loading organization PDFs...';
    if (orgDocuments.length === 0) return 'No organization PDFs are available yet.';
    return 'Choose a reusable organization PDF as the application base.';
  }, [isLoadingOrgDocuments, orgDocuments.length]);

  return (
    <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
      <Helmet>
        <title>Create PDF application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      <div className="tw-mt-3 tw-mb-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={returnToApplications}
        >
          <i className="fas fa-chevron-left tw-mr-1" aria-hidden />
          Back
        </button>
      </div>

      <div className="jumbotron jumbotron-fluid bg-white pb-0">
        <h1 className="display-4">Create PDF application</h1>
      </div>

      {step === 'client' && (
        <section className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-sm tw-p-5 sm:tw-p-6">
          <div className="tw-flex tw-items-start tw-gap-4 tw-mb-5">
            <span className="tw-flex tw-h-14 tw-w-14 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-blue-100 tw-bg-blue-50 tw-text-twprimary">
              <PersonSearchOutlinedIcon fontSize="large" />
            </span>
            <div>
              <h2 className="h5 tw-mb-1">Select client</h2>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-0">
                Choose the client before selecting the PDF source.
              </p>
            </div>
          </div>

          <Form.Group controlId="createDocumentClientSearch">
            <Form.Label>Client</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search and choose a client..."
              value={clientQuery}
              onChange={(event) => searchClients(event.target.value)}
            />
          </Form.Group>

          {clientUsername && (
            <Alert variant="success" className="tw-mt-3 tw-mb-0">
              Selected client: <strong>{selectedClientLabel}</strong>
            </Alert>
          )}
          {clientSearching && (
            <div className="tw-text-sm tw-text-gray-500 tw-mt-2">Searching...</div>
          )}
          {clientError && (
            <Alert variant="warning" className="tw-mt-3">
              {clientError}
            </Alert>
          )}
          {clientResultsOpen && clientResults.length > 0 && (
            <div className="tw-border tw-rounded-lg tw-mt-3 tw-divide-y tw-divide-gray-200 tw-max-h-80 tw-overflow-y-auto">
              {clientResults.map((client) => {
                const displayName = getClientDisplayName(client);
                return (
                  <button
                    key={client.username}
                    type="button"
                    className="tw-w-full tw-border-0 tw-bg-white tw-px-4 tw-py-3 tw-text-left hover:tw-bg-gray-50"
                    onClick={() => selectClient(client)}
                  >
                    <span className="tw-block tw-font-semibold tw-text-gray-900">{displayName}</span>
                    <span className="tw-block tw-text-sm tw-text-gray-500">{client.username}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-end tw-gap-3 tw-mt-6">
            <Button type="button" variant="outline-secondary" onClick={returnToApplications}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!clientUsername}
              onClick={() => setStep('source')}
            >
              Continue
            </Button>
          </div>
        </section>
      )}

      {step === 'source' && (
        <>
          <section className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-sm tw-p-5 sm:tw-p-6 tw-mb-5">
            <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-3">
              <div>
                <div className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500">
                  Client
                </div>
                <div className="tw-text-xl tw-font-semibold tw-text-gray-900">
                  {selectedClientLabel}
                </div>
              </div>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  setStep('client');
                  setSourceType(null);
                  resetSourceErrors();
                }}
              >
                Change client
              </Button>
            </div>
          </section>

          {orgDocumentsError && (
            <Alert variant="warning" className="tw-mb-4">
              {orgDocumentsError}
            </Alert>
          )}

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
            <SourceCard
              title="Upload a PDF"
              description="Use a completed or outside application PDF."
              icon={<CloudUploadOutlinedIcon fontSize="large" />}
              selected={sourceType === 'upload'}
              onClick={() => chooseSource('upload')}
            />
            <SourceCard
              title="Use organization document"
              description={orgDocumentDescription}
              icon={isLoadingOrgDocuments ? <Spinner animation="border" size="sm" /> : <ArticleOutlinedIcon fontSize="large" />}
              selected={sourceType === 'org'}
              disabled={isLoadingOrgDocuments || orgDocuments.length === 0}
              onClick={() => chooseSource('org')}
            />
          </div>

          {sourceType === 'upload' && (
            <section className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-sm tw-p-5 sm:tw-p-6 tw-mt-5">
              <div className="tw-flex tw-items-start tw-gap-4 tw-mb-4">
                <span className="tw-flex tw-h-12 tw-w-12 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-blue-100 tw-bg-blue-50 tw-text-twprimary">
                  <AddIcon fontSize="medium" />
                </span>
                <div>
                  <h2 className="h5 tw-mb-1">Upload PDF</h2>
                  <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Create an application from a local PDF.</p>
                </div>
              </div>

              {uploadError && (
                <Alert variant="danger" className="tw-mb-4">
                  {uploadError}
                </Alert>
              )}

              <Form.Group controlId="uploadApplicationName">
                <Form.Label>Application name</Form.Label>
                <Form.Control
                  type="text"
                  value={uploadApplicationName}
                  onChange={(event) => {
                    setUploadApplicationName(event.target.value);
                    setUploadError(null);
                  }}
                  disabled={uploadSubmitting}
                  placeholder="e.g. Housing Assistance Application"
                />
              </Form.Group>

              <Form.Group controlId="uploadApplicationFile" className="tw-mt-4">
                <Form.Label>PDF file</Form.Label>
                <Form.Control
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setUploadFile(event.target.files?.[0] || null);
                    setUploadError(null);
                  }}
                  disabled={uploadSubmitting}
                />
                {uploadFile && (
                  <div className="tw-text-sm tw-text-gray-600 tw-mt-2">{uploadFile.name}</div>
                )}
              </Form.Group>

              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-end tw-gap-3 tw-mt-6">
                <Button
                  type="button"
                  variant="outline-secondary"
                  disabled={uploadSubmitting}
                  onClick={() => setSourceType(null)}
                >
                  Back to source choices
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={uploadSubmitting || !uploadApplicationName.trim() || !uploadFile}
                  onClick={handleUploadApplication}
                >
                  {uploadSubmitting ? 'Uploading...' : 'Create application'}
                </Button>
              </div>
            </section>
          )}

          {sourceType === 'org' && (
            <section className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-sm tw-p-5 sm:tw-p-6 tw-mt-5">
              <div className="tw-flex tw-items-start tw-gap-4 tw-mb-4">
                <span className="tw-flex tw-h-12 tw-w-12 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-blue-100 tw-bg-blue-50 tw-text-twprimary">
                  <ArticleOutlinedIcon fontSize="medium" />
                </span>
                <div>
                  <h2 className="h5 tw-mb-1">Organization document</h2>
                  <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Create an application from an organization PDF.</p>
                </div>
              </div>

              {orgError && (
                <Alert variant="danger" className="tw-mb-4">
                  {orgError}
                </Alert>
              )}

              <Form.Group controlId="orgDocumentSource">
                <Form.Label>Organization document</Form.Label>
                <Form.Control
                  as="select"
                  value={orgSourceDocumentId}
                  onChange={(event) => handleOrgDocumentSelection(event.target.value)}
                  disabled={orgSubmitting}
                >
                  <option value="">Choose a document...</option>
                  {orgDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.filename}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="orgApplicationName" className="tw-mt-4">
                <Form.Label>Application name</Form.Label>
                <Form.Control
                  type="text"
                  value={orgApplicationName}
                  onChange={(event) => {
                    setOrgApplicationName(event.target.value);
                    setOrgError(null);
                  }}
                  disabled={orgSubmitting}
                />
              </Form.Group>

              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-end tw-gap-3 tw-mt-6">
                <Button
                  type="button"
                  variant="outline-secondary"
                  disabled={orgSubmitting}
                  onClick={() => setSourceType(null)}
                >
                  Back to source choices
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={orgSubmitting || !orgApplicationName.trim() || !orgSourceDocumentId}
                  onClick={handleCreateFromOrgDocument}
                >
                  {orgSubmitting ? 'Creating...' : 'Create application'}
                </Button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
