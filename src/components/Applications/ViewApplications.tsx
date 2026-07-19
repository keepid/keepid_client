import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link, Redirect, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Role from '../../static/Role';
import { getClientSearchCandidateQueries, matchesClientSearchQuery } from '../../utils/clientSearch';
import DataTable, { DataTableColumn } from '../BaseComponents/DataTable';
import RowActionMenu, { RowAction } from '../BaseComponents/RowActionMenu';
import {
  createUploadedApplication,
} from './api/interactiveForm';
import ApplicationPdfPreview from './ApplicationPdfPreview';
import ApplicationSelectorFlow from './applicationSelector/ApplicationSelectorFlow';

interface DocumentInformation {
  uploader: string,
  organizationName: string,
  id: string,
  uploadDate: string,
  createdDate?: string,
  filename: string,
  applicationDisplayName?: string,
  formattedUploadDate?: string,
  formattedCreatedDate?: string,
  status?: string,
  applicationStatus?: string,
  applicationState?: string,
  clientFirstName?: string,
  clientLastName?: string,
  clientName?: string,
  clientDeleted?: boolean,
  createdByUsername?: string,
  createdByFirstName?: string,
  createdByLastName?: string,
  createdByName?: string,
}

interface ClientSearchResult {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Props {
  username: string,
  name: string,
  organization: string,
  role: Role,
}

interface AvailableApplication {
  applicationId: string;
  label: string;
  state: string;
  idType: string;
  housingStatus: string;
}

type ApplicationFilterKey = 'state' | 'idType' | 'housingStatus';

interface State {
  currentApplicationId: string | undefined,
  currentApplicationFilename: string | undefined,
  currentApplicationUploader: string | undefined,
  documents: DocumentInformation[],
  isLoadingDocuments: boolean,
  documentsError: string | null,
  clientUsername: string | undefined,
  clientName: string | undefined,
  deleteTargetApplication: DocumentInformation | null,
  renameTarget: DocumentInformation | null,
  renameValue: string,
  isRenaming: boolean,
  availableApplications: AvailableApplication[],
  applicationStateFilter: string,
  applicationIdTypeFilter: string,
  applicationHousingStatusFilter: string,
  applicationHousingStatusFilterTouched: boolean,
  uploadModalOpen: boolean,
  uploadApplicationName: string,
  uploadFile: File | null,
  uploadSubmitting: boolean,
  uploadError: string | null,
  modalClientUsername: string,
  modalClientName: string,
  modalClientQuery: string,
  modalClientResults: ClientSearchResult[],
  modalClientSearching: boolean,
  modalClientError: string | null,
  modalClientResultsOpen: boolean,
}

interface LocationState {
  clientUsername: string;
  clientName?: string;
}

class ViewApplications extends Component<Props & RouteComponentProps, State, {}> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      currentApplicationId: undefined,
      currentApplicationFilename: undefined,
      currentApplicationUploader: undefined,
      documents: [],
      isLoadingDocuments: false,
      documentsError: null,
      clientUsername: undefined,
      clientName: undefined,
      deleteTargetApplication: null,
      renameTarget: null,
      renameValue: '',
      isRenaming: false,
      availableApplications: [],
      applicationStateFilter: '',
      applicationIdTypeFilter: '',
      applicationHousingStatusFilter: '',
      applicationHousingStatusFilterTouched: false,
      uploadModalOpen: false,
      uploadApplicationName: '',
      uploadFile: null,
      uploadSubmitting: false,
      uploadError: null,
      modalClientUsername: '',
      modalClientName: '',
      modalClientQuery: '',
      modalClientResults: [],
      modalClientSearching: false,
      modalClientError: null,
      modalClientResultsOpen: false,
    };
  }

  formatUploadDate = (rawDate: string): string => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return rawDate;
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  getApplicationDisplayName = (row: DocumentInformation): string => {
    const preferredName = row.applicationDisplayName?.trim();
    if (preferredName) return preferredName;
    if (!row.filename) return '';
    return row.filename
      .replace(/\.pdf$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  getDeletedClientLabel = (name: string, row: DocumentInformation): string => {
    if (!row.clientDeleted || name.endsWith(' (deleted)')) return name;
    return `${name} (deleted)`;
  };

  getClientDisplayName = (row: DocumentInformation): string => {
    const fullName = row.clientName?.trim();
    if (fullName) return this.getDeletedClientLabel(fullName, row);
    const first = row.clientFirstName?.trim() || '';
    const last = row.clientLastName?.trim() || '';
    const composed = `${first} ${last}`.trim();
    const name = composed || row.uploader || '-';
    return this.getDeletedClientLabel(name, row);
  };

  getUploaderDisplayName = (row: DocumentInformation): string => {
    const fullName = row.createdByName?.trim();
    if (fullName) return fullName;
    const first = row.createdByFirstName?.trim() || '';
    const last = row.createdByLastName?.trim() || '';
    const composed = `${first} ${last}`.trim();
    if (composed) return composed;
    return row.createdByUsername || row.uploader || '-';
  };

  mapDocuments = (documents: DocumentInformation[]): DocumentInformation[] =>
    documents.map((doc) => ({
      ...doc,
      formattedUploadDate: this.formatUploadDate(doc.uploadDate || ''),
      formattedCreatedDate: this.formatUploadDate(doc.createdDate || doc.uploadDate || ''),
      clientName: this.getClientDisplayName(doc),
      createdByName: this.getUploaderDisplayName(doc),
    }));

  getClientSearchDisplayName = (client: ClientSearchResult): string =>
    `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || 'Client';

  resetModalClientPicker = () => {
    const { clientUsername, clientName } = this.state;
    const resolvedClientUsername = clientUsername || '';
    const resolvedClientName = clientName || resolvedClientUsername;
    this.setState({
      modalClientUsername: resolvedClientUsername,
      modalClientName: resolvedClientName,
      modalClientQuery: resolvedClientName,
      modalClientResults: [],
      modalClientSearching: false,
      modalClientError: null,
      modalClientResultsOpen: false,
    });
  };

  searchModalClients = (query: string) => {
    const trimmedQuery = query.trim();
    this.setState({
      modalClientQuery: query,
      modalClientUsername: '',
      modalClientName: '',
      modalClientResultsOpen: true,
      modalClientError: null,
    });

    if (trimmedQuery.length < 2) {
      this.setState({ modalClientResults: [], modalClientSearching: false });
      return;
    }

    const searchQueries = getClientSearchCandidateQueries(trimmedQuery);

    this.setState({ modalClientSearching: true });
    Promise.all(searchQueries.map((name) => fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        role: this.props.role,
        listType: 'clients',
        name,
      }),
    }).then((response) => response.json())))
      .then((responses) => {
        const latestQuery = this.state.modalClientQuery.trim();
        if (latestQuery !== trimmedQuery) return;
        const peopleByUsername = new Map<string, ClientSearchResult>();
        let hasSearchError = false;

        responses.forEach((responseJSON) => {
          if (responseJSON.status === 'SUCCESS' && Array.isArray(responseJSON.people)) {
            responseJSON.people.forEach((client: ClientSearchResult) => {
              if (client.username) peopleByUsername.set(client.username, client);
            });
          } else if (responseJSON.status && responseJSON.status !== 'USER_NOT_FOUND') {
            hasSearchError = true;
          }
        });

        const filtered = Array.from(peopleByUsername.values())
          .filter((client: ClientSearchResult) => matchesClientSearchQuery(client, trimmedQuery))
          .slice(0, 25);
        this.setState({
          modalClientResults: filtered,
          modalClientSearching: false,
          modalClientError: hasSearchError && filtered.length === 0
            ? 'Could not load client search results.'
            : null,
        });
      })
      .catch(() => {
        if (this.state.modalClientQuery.trim() !== trimmedQuery) return;
        this.setState({
          modalClientResults: [],
          modalClientSearching: false,
          modalClientError: 'Could not load client search results.',
        });
      });
  };

  selectModalClient = (client: ClientSearchResult) => {
    const displayName = this.getClientSearchDisplayName(client);
    this.setState({
      modalClientUsername: client.username,
      modalClientName: displayName,
      modalClientQuery: displayName,
      modalClientResults: [],
      modalClientError: null,
      modalClientResultsOpen: false,
    });
  };

  openUploadModal = () => {
    this.resetModalClientPicker();
    this.setState({ uploadModalOpen: true, uploadError: null });
  };

  loadAvailableApplications = () => {
    fetch(`${getServerURL()}/get-available-application-options`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((items) => {
        if (!Array.isArray(items)) {
          this.setState({ availableApplications: [] });
          return;
        }
        const parsed = items
          .filter((x) => x && x.applicationId && x.label)
          .map((x) => ({
            applicationId: String(x.applicationId),
            label: String(x.label),
            state: x.state == null ? '' : String(x.state),
            idType: x.idType == null ? '' : String(x.idType),
            housingStatus: x.housingStatus == null ? '' : String(x.housingStatus),
          }));
        this.setState({ availableApplications: parsed });
      })
      .catch(() => {
        this.setState({ availableApplications: [] });
      });
  };

  getProfileHousingStatus = (profile: Record<string, unknown>): string => {
    const raw = profile.experiencingHomelessness;
    if (raw === true || String(raw).toLowerCase() === 'true') return 'Homeless';
    if (raw === false || String(raw).toLowerCase() === 'false') return 'Housed';
    return '';
  };

  loadClientHousingStatus = (clientUsername?: string) => {
    if (!clientUsername) return;

    fetch(`${getServerURL()}/get-user-info`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: clientUsername }),
    })
      .then((response) => response.json())
      .then((profile) => {
        if (this.state.clientUsername !== clientUsername) return;
        if (this.state.applicationHousingStatusFilterTouched) return;
        if (!profile || profile.status !== 'SUCCESS') return;
        const housingStatus = this.getProfileHousingStatus(profile);
        if (!housingStatus) return;
        this.setState({ applicationHousingStatusFilter: housingStatus });
      })
      .catch(() => {
        // Best-effort default only; leave filters user-controlled if profile lookup fails.
      });
  };

  getApplicationFilterOptions = (
    field: ApplicationFilterKey,
    preferredOrder: string[],
  ): string[] => {
    const values = new Set(
      this.state.availableApplications
        .map((application) => application[field].trim())
        .filter((value) => value.length > 0),
    );
    return [
      ...preferredOrder.filter((value) => values.delete(value)),
      ...Array.from(values).sort((a, b) => a.localeCompare(b)),
    ];
  };

  matchesApplicationFilter = (
    value: string,
    filter: string,
    includeBroadMatches = false,
  ): boolean => {
    if (!filter) return true;
    const normalizedValue = value.trim();
    if (includeBroadMatches && !normalizedValue) return true;
    return normalizedValue === filter;
  };

  getFilteredAvailableApplications = (): AvailableApplication[] => {
    const {
      availableApplications,
      applicationStateFilter,
      applicationIdTypeFilter,
      applicationHousingStatusFilter,
    } = this.state;

    return availableApplications.filter((application) => (
      this.matchesApplicationFilter(application.state, applicationStateFilter, true)
      && this.matchesApplicationFilter(application.idType, applicationIdTypeFilter)
      && this.matchesApplicationFilter(application.housingStatus, applicationHousingStatusFilter, true)
    ));
  };

  clearApplicationFilters = () => {
    this.setState({
      applicationStateFilter: '',
      applicationIdTypeFilter: '',
      applicationHousingStatusFilter: '',
      applicationHousingStatusFilterTouched: true,
    });
  };

  renderApplicationFilters = (
    availableApplications: AvailableApplication[],
    filteredApplications: AvailableApplication[],
  ) => {
    const {
      applicationStateFilter,
      applicationIdTypeFilter,
      applicationHousingStatusFilter,
    } = this.state;
    const stateOptions = this.getApplicationFilterOptions('state', ['PA', 'NJ', 'NY']);
    const idTypeOptions = this.getApplicationFilterOptions('idType', [
      'Birth Certificate',
      'Photo ID',
      'Social Security Card',
    ]);
    const housingStatusOptions = this.getApplicationFilterOptions('housingStatus', ['Homeless', 'Housed']);
    const hasFilters = Boolean(
      applicationStateFilter
      || applicationIdTypeFilter
      || applicationHousingStatusFilter,
    );

    if (availableApplications.length === 0) return null;

    return (
      <div className="tw-mb-3 tw-bg-blue-50 tw-px-4 tw-py-3">
        <div className="tw-mb-2 tw-flex tw-justify-end">
          <span className="tw-text-xs tw-font-medium tw-text-gray-500">
            Showing {filteredApplications.length} of {availableApplications.length}
          </span>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-3 lg:tw-flex-row lg:tw-items-end">
          <div className="tw-grid tw-flex-1 tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-3">
            <label htmlFor="application-housing-filter" className="tw-text-xs tw-font-semibold tw-text-blue-900">
              <span className="tw-block">Housing</span>
              <select
                id="application-housing-filter"
                className="form-control form-control-sm tw-mt-1"
                value={applicationHousingStatusFilter}
                onChange={(e) => this.setState({
                  applicationHousingStatusFilter: e.target.value,
                  applicationHousingStatusFilterTouched: true,
                })}
              >
                <option value="">All housing</option>
                {housingStatusOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label htmlFor="application-state-filter" className="tw-text-xs tw-font-semibold tw-text-blue-900">
              <span className="tw-block">State</span>
              <select
                id="application-state-filter"
                className="form-control form-control-sm tw-mt-1"
                value={applicationStateFilter}
                onChange={(e) => this.setState({ applicationStateFilter: e.target.value })}
              >
                <option value="">All states</option>
                {stateOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label htmlFor="application-id-type-filter" className="tw-text-xs tw-font-semibold tw-text-blue-900">
              <span className="tw-block">ID type</span>
              <select
                id="application-id-type-filter"
                className="form-control form-control-sm tw-mt-1"
                value={applicationIdTypeFilter}
                onChange={(e) => this.setState({ applicationIdTypeFilter: e.target.value })}
              >
                <option value="">All ID types</option>
                {idTypeOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          {hasFilters && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary tw-self-start lg:tw-self-auto"
              onClick={this.clearApplicationFilters}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    );
  };

  renderAvailableApplicationRows = (
    availableApplications: AvailableApplication[],
    filteredApplications: AvailableApplication[],
    clientUsername?: string,
    clientName?: string,
  ) => {
    if (filteredApplications.length > 0) {
      return filteredApplications.map((application) => (
        <Link
          key={application.applicationId}
          to={{
            pathname: '/applications/createnew',
            state: {
              clientUsername: clientUsername || '',
              clientName: clientName || '',
              presetApplication: {
                applicationId: application.applicationId,
                label: application.label,
                state: application.state,
                idType: application.idType,
                housingStatus: application.housingStatus,
              },
              startAtReview: true,
            },
          }}
          className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-border-b tw-border-gray-200 tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-no-underline last:tw-border-b-0 hover:tw-bg-blue-50"
        >
          <span className="tw-min-w-0">
            <span className="tw-block tw-truncate tw-font-medium tw-text-gray-900">
              {application.label}
            </span>
          </span>
          <span className="tw-flex tw-shrink-0 tw-items-center tw-gap-2 tw-text-twprimary">
            <span className="tw-hidden sm:tw-inline">Start</span>
          </span>
        </Link>
      ));
    }

    if (availableApplications.length > 0) {
      return (
        <div className="tw-px-4 tw-py-4 tw-text-sm tw-text-gray-500">
          No supported forms match these filters.
        </div>
      );
    }

    return (
      <div className="tw-px-4 tw-py-4 tw-text-sm tw-text-gray-500">
        No supported forms are available.
      </div>
    );
  };

  loadDocuments = (targetUsername?: string, targetName?: string) => {
    const isWorkerView = Boolean(targetUsername && targetUsername.trim().length > 0);
    const previousClientUsername = this.state.clientUsername;
    const nextClientUsername = isWorkerView ? targetUsername : undefined;
    const clientChanged = previousClientUsername !== nextClientUsername;
    const clientFilterReset = clientChanged
      ? {
        applicationHousingStatusFilter: '',
        applicationHousingStatusFilterTouched: false,
      }
      : {};

    this.setState({
      clientUsername: nextClientUsername,
      clientName: isWorkerView ? targetName : undefined,
      ...clientFilterReset,
      isLoadingDocuments: true,
      documentsError: null,
    }, () => {
      if (clientChanged && nextClientUsername) {
        this.loadClientHousingStatus(nextClientUsername);
      }
    });

    // /list-applications returns a flat array of ApplicationListItemDto rows
    // (id, state, title, client*, timestamps, attachmentCount).
    // Authz lives in the handler: client sees own; same-org staff sees all.
    // The previous /get-files APPLICATION_PDF call returned [] by design
    // (FileService treats applications as not-files) — see slice 12 work.
    fetch(`${getServerURL()}/list-applications`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (response.status === 404) {
          // BE not yet deployed with /list-applications — render empty state
          // rather than an error banner.
          return [];
        }
        return response.json();
      })
      .then((responseJSON) => {
        const items = Array.isArray(responseJSON) ? responseJSON : [];
        // Map ApplicationListItemDto → DocumentInformation. The FE's table
        // was originally written against /get-files documents; we map field
        // names without touching the table itself so the rest of the page
        // (download, delete, row actions) keeps working.
        const filteredItems = isWorkerView
          ? items.filter((item) => item && item.clientUsername === targetUsername)
          : items;
        const newDocuments: DocumentInformation[] = filteredItems.map((item, index) => ({
          id: String(item.id || ''),
          uploader: String(item.clientUsername || ''),
          organizationName: '',
          uploadDate: String(item.updatedAt || item.createdAt || ''),
          createdDate: String(item.createdAt || item.updatedAt || ''),
          filename: `${String(item.title || 'Application')}.pdf`,
          applicationDisplayName: String(item.title || 'Application'),
          applicationState: String(item.state || ''),
          applicationStatus: String(item.state || ''),
          status: String(item.state || ''),
          clientFirstName: String(item.clientFirstName || ''),
          clientLastName: String(item.clientLastName || ''),
          clientDeleted: Boolean(item.clientDeleted),
          createdByUsername: String(item.createdByUsername || ''),
          createdByFirstName: String(item.createdByFirstName || ''),
          createdByLastName: String(item.createdByLastName || ''),
          // index used by some table internals
          ...(index !== undefined ? { index } : {}),
        }));
        const mapped = this.mapDocuments(newDocuments);
        this.setState({
          documents: mapped,
          isLoadingDocuments: false,
          documentsError: null,
        });
      })
      .catch(() => {
        this.setState({
          documents: [],
          isLoadingDocuments: false,
          documentsError: 'Could not load applications.',
        });
      });
  };

  componentDidMount() {
    this.loadFromLocation();
    if (this.props.role !== Role.Client) {
      this.loadAvailableApplications();
    }
  }

  componentDidUpdate(prevProps: Props & RouteComponentProps) {
    if (prevProps.location !== this.props.location) {
      this.loadFromLocation();
    }
  }

  loadFromLocation = () => {
    const { location } = this.props;
    const params = new URLSearchParams(location.search || '');
    const forceAll = params.get('view') === 'all';
    if (forceAll) {
      this.loadDocuments(undefined, undefined);
      return;
    }

    const state = location.state as LocationState | undefined;
    const locationClientUsername = state?.clientUsername && state.clientUsername.trim().length > 0
      ? state.clientUsername
      : undefined;
    const locationClientName = state?.clientName;
    this.loadDocuments(locationClientUsername, locationClientName);
  };

  handleOpenApplication = (row: DocumentInformation) => {
    const {
      id,
      filename,
      uploader,
    } = row;
    const { clientUsername } = this.state;
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
        currentApplicationUploader: uploader,
      },
      () => {
        this.props.history.push({
          pathname: '/applications/preview',
          state: {
            applicationId: id,
            applicationFilename: filename,
            targetUser: uploader,
            clientUsername: clientUsername || '',
            applicantName: this.getClientDisplayName(row),
            uploadedByName: this.getUploaderDisplayName(row),
            createdDate: row.createdDate || '',
            lastUpdatedDate: row.uploadDate || '',
          },
        });
      },
    );
  };

  handleDownloadApplication = (row: DocumentInformation) => {
    fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: row.id,
        fileType: FileType.APPLICATION_PDF,
        targetUser: row.uploader,
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = row.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => {});
  };

  confirmDeleteApplication = () => {
    const { deleteTargetApplication } = this.state;
    if (!deleteTargetApplication) return;
    const deletedId = deleteTargetApplication.id;

    fetch(`${getServerURL()}/delete-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: deletedId,
        fileType: FileType.APPLICATION_PDF,
        targetUser: deleteTargetApplication.uploader,
      }),
    })
      // Tolerate empty / non-JSON bodies — see the matching pattern in
      // updateApplicationAttachmentPdf. The /delete-file route returns
      // a JSON envelope on success, but if it ever 4xx-s with an empty
      // body we want to fall through to the optimistic local prune
      // and the refetch instead of crashing the handler.
      .then((response) => response.text().catch(() => ''))
      .then((text) => {
        let json: { status?: string } = {};
        try { if (text) json = JSON.parse(text) as typeof json; } catch { /* ignore */ }
        // Optimistically prune the deleted row from local state so the
        // table updates immediately. The subsequent loadDocuments fetch
        // is the source-of-truth refresh and will reconcile if anything
        // diverged. Even on a non-SUCCESS response we still close the
        // modal — the user can re-open if it turns out the row stuck
        // around (loadDocuments will surface the truth either way).
        this.setState((prev) => ({
          deleteTargetApplication: null,
          documents: prev.documents.filter((d) => d.id !== deletedId),
        }));
        if (json.status && json.status !== 'SUCCESS') {
          // eslint-disable-next-line no-console
          console.warn('delete-file returned non-success status', json.status);
        }
        const { clientUsername, clientName } = this.state;
        this.loadDocuments(clientUsername, clientName);
      })
      .catch(() => {
        // Network/transport failure — close the modal and re-fetch so
        // the user sees the truth instead of being stuck on a spinner.
        this.setState({ deleteTargetApplication: null });
        const { clientUsername, clientName } = this.state;
        this.loadDocuments(clientUsername, clientName);
      });
  };

  openRenameModal = (row: DocumentInformation) => {
    const displayName = row.filename?.replace(/\.pdf$/i, '') || '';
    this.setState({ renameTarget: row, renameValue: displayName });
  };

  closeRenameModal = () => {
    this.setState({ renameTarget: null, renameValue: '', isRenaming: false });
  };

  confirmRename = () => {
    const { renameTarget, renameValue } = this.state;
    if (!renameTarget || !renameValue.trim()) return;

    const newFilename = renameValue.trim().endsWith('.pdf')
      ? renameValue.trim()
      : `${renameValue.trim()}.pdf`;

    this.setState({ isRenaming: true });
    fetch(`${getServerURL()}/rename-file`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: renameTarget.id,
        newFilename,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json?.status === 'SUCCESS') {
          this.closeRenameModal();
          const { clientUsername, clientName } = this.state;
          this.loadDocuments(clientUsername, clientName);
        } else {
          this.setState({ isRenaming: false });
        }
      })
      .catch(() => {
        this.setState({ isRenaming: false });
      });
  };

  navigateToCreatedApplication = (
    applicationId: string,
    applicationName: string,
    targetUser: string,
    targetName: string,
  ) => {
    const { clientUsername, clientName } = this.state;
    this.loadDocuments(clientUsername, clientName);
    this.props.history.push({
      pathname: '/applications/preview',
      state: {
        applicationId,
        applicationFilename: `${applicationName}.pdf`,
        targetUser,
        clientUsername: targetUser,
        applicantName: targetName || targetUser,
        uploadedByName: this.props.name || this.props.username,
        createdDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString(),
      },
    });
  };

  handleUploadApplication = () => {
    const {
      uploadApplicationName,
      uploadFile,
      modalClientUsername,
      modalClientName,
    } = this.state;
    if (!modalClientUsername) {
      this.setState({ uploadError: 'Choose the client this application is for.' });
      return;
    }
    if (!uploadApplicationName.trim() || !uploadFile) {
      this.setState({ uploadError: 'Enter an application name and choose a PDF.' });
      return;
    }
    this.setState({ uploadSubmitting: true, uploadError: null });
    createUploadedApplication(uploadFile, uploadApplicationName.trim(), modalClientUsername)
      .then((result) => {
        const applicationId = result.applicationId || result.fileId;
        if (!applicationId) throw new Error('Server did not return an application id.');
        const name = uploadApplicationName.trim();
        this.setState({
          uploadModalOpen: false,
          uploadApplicationName: '',
          uploadFile: null,
          uploadSubmitting: false,
        });
        this.navigateToCreatedApplication(applicationId, name, modalClientUsername, modalClientName);
      })
      .catch((error) => {
        this.setState({
          uploadSubmitting: false,
          uploadError: error instanceof Error ? error.message : 'Could not upload application.',
        });
      });
  };

  getRowActions = (row: DocumentInformation): RowAction[] => {
    if (this.props.role === Role.Client) {
      return [
        {
          label: 'Download',
          icon: <FileDownloadOutlinedIcon fontSize="small" />,
          onClick: () => this.handleDownloadApplication(row),
        },
        {
          label: 'Delete',
          icon: <DeleteOutlineIcon fontSize="small" />,
          onClick: () => this.setState({ deleteTargetApplication: row }),
          danger: true,
        },
      ];
    }

    return [
      {
        label: 'Download',
        icon: <FileDownloadOutlinedIcon fontSize="small" />,
        onClick: () => this.handleDownloadApplication(row),
      },
      {
        label: 'Rename',
        icon: <DriveFileRenameOutlineIcon fontSize="small" />,
        onClick: () => this.openRenameModal(row),
      },
      {
        label: 'Delete',
        icon: <DeleteOutlineIcon fontSize="small" />,
        onClick: () => this.setState({ deleteTargetApplication: row }),
        danger: true,
      },
    ];
  };

  renderModalClientPicker = (disabled: boolean) => {
    const {
      modalClientUsername,
      modalClientName,
      modalClientQuery,
      modalClientResults,
      modalClientSearching,
      modalClientError,
      modalClientResultsOpen,
    } = this.state;

    return (
      <div className="tw-mb-3">
        <label htmlFor="application-client-search" className="form-label fw-semibold">
          Client
        </label>
        <input
          id="application-client-search"
          type="text"
          className="form-control"
          placeholder="Search and choose a client..."
          value={modalClientQuery}
          onChange={(event) => this.searchModalClients(event.target.value)}
          disabled={disabled}
        />
        {modalClientUsername && (
          <div className="tw-text-sm tw-text-gray-600 tw-mt-2">
            Selected client: <strong>{modalClientName || modalClientUsername}</strong>
          </div>
        )}
        {modalClientSearching && (
          <div className="tw-text-sm tw-text-gray-500 tw-mt-2">Searching...</div>
        )}
        {modalClientError && (
          <div className="alert alert-warning py-2 tw-mt-2">{modalClientError}</div>
        )}
        {modalClientResultsOpen && modalClientResults.length > 0 && (
          <div className="tw-border tw-rounded tw-mt-2 tw-divide-y tw-divide-gray-200 tw-max-h-56 tw-overflow-y-auto">
            {modalClientResults.map((client) => {
              const displayName = this.getClientSearchDisplayName(client);
              const secondaryLabel = client.email?.trim();
              return (
                <button
                  key={client.username}
                  type="button"
                  className="tw-w-full tw-text-left tw-border-0 tw-bg-white tw-px-3 tw-py-2 hover:tw-bg-gray-50"
                  onClick={() => this.selectModalClient(client)}
                  disabled={disabled}
                >
                  <div className="tw-font-semibold">{displayName}</div>
                  {secondaryLabel && (
                    <div className="tw-text-sm tw-text-gray-500">{secondaryLabel}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      currentApplicationUploader,
      documents,
      isLoadingDocuments,
      documentsError,
      clientUsername,
      clientName,
      deleteTargetApplication,
      renameTarget,
      renameValue,
      isRenaming,
      availableApplications,
      uploadModalOpen,
      uploadApplicationName,
      uploadFile,
      uploadSubmitting,
      uploadError,
      modalClientUsername,
    } = this.state;
    const isClientUser = this.props.role === Role.Client;
    const pageTitle = isClientUser ? 'My Applications' : 'Applications';
    const applicationsOwner = (clientUsername === '' || clientUsername === undefined)
      ? ''
      : `${clientName || clientUsername || 'Client'}'s`;
    const filteredAvailableApplications = this.getFilteredAvailableApplications();

    const columns: DataTableColumn<DocumentInformation>[] = [
      {
        field: 'filename',
        headerName: 'Application',
        renderCell: (row) => this.getApplicationDisplayName(row),
      },
      ...(isClientUser ? [] : [{
        field: 'clientName',
        headerName: 'Client',
        sortable: true,
        width: '22%',
        hideOnMobile: true,
        renderCell: (row: DocumentInformation) => this.getClientDisplayName(row),
      } as DataTableColumn<DocumentInformation>]),
      {
        field: 'createdDate',
        headerName: 'Created',
        sortable: true,
        sortType: 'date',
        width: '18%',
        nowrap: true,
        renderCell: (row) => row.formattedCreatedDate || '-',
      } as DataTableColumn<DocumentInformation>,
      {
        field: 'actions',
        headerName: isClientUser ? 'Actions' : '',
        align: 'right',
        width: isClientUser ? '26%' : '48px',
        hideOnMobile: true,
        renderCell: (row) => (
          isClientUser ? (
            <div className="tw-flex tw-justify-end tw-gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  this.handleDownloadApplication(row);
                }}
              >
                Download
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  this.setState({ deleteTargetApplication: row });
                }}
              >
                Delete
              </button>
            </div>
          ) : (
            <RowActionMenu actions={this.getRowActions(row)} />
          )
        ),
      } as DataTableColumn<DocumentInformation>,
    ].filter((col) => {
      if (isClientUser && (col.field === 'actions' || col.field === 'uploadDate')) {
        return false;
      }
      return true;
    });

    return (
      <Switch>
        <Route exact path="/applications">
          <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
            <Helmet>
              <title>{pageTitle}</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="tw-mt-3 tw-mb-4 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
              <button
                type="button"
                className="btn btn-primary mr-2"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fas fa-chevron-left tw-mr-1" aria-hidden />
                Back
              </button>
              {!isClientUser && clientUsername && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary mr-2"
                    onClick={() => this.props.history.push(`/profile/${clientUsername}`)}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => this.props.history.push({
                      pathname: `/my-documents/${clientUsername}`,
                      state: {
                        clientName,
                      },
                    })}
                  >
                    Documents
                  </button>
                </>
              )}
            </div>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div>
                <h1 className="display-4">{applicationsOwner ? `${applicationsOwner} Applications` : pageTitle}</h1>
              </div>
            </div>
            <div>
              <DataTable
                columns={columns}
                data={documents}
                isLoading={isLoadingDocuments}
                errorMessage={documentsError}
                emptyMessage={clientName || clientUsername ? `No applications for ${clientName || clientUsername}` : 'No applications found'}
                showSearch={false}
                pageSize={10}
                defaultSortField="createdDate"
                defaultSortDirection="desc"
                onRowClick={this.handleOpenApplication}
              />
            </div>
            {!isClientUser && (
              <div className="tw-mt-8">
                <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-mb-3">
                  <h2 className="h5 tw-mb-0">Start a new application</h2>
                </div>
                {clientUsername && (
                  <Link
                    to={{
                      pathname: '/applications/selector',
                      state: {
                        clientUsername,
                        clientName: clientName || '',
                      },
                    }}
                    className="tw-mb-4 tw-flex tw-items-center tw-justify-between tw-gap-4 tw-rounded-md tw-border tw-border-blue-100 tw-bg-blue-50 tw-px-4 tw-py-4 tw-text-sm tw-no-underline tw-shadow-sm hover:tw-bg-blue-100"
                  >
                    <span className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
                      <img
                        src="/SelectApplicationForm/pennsylvania.svg"
                        alt=""
                        aria-hidden="true"
                        className="tw-h-10 tw-w-10 tw-shrink-0"
                      />
                      <span className="tw-block tw-min-w-0 tw-truncate tw-font-semibold tw-text-gray-900">
                        Application Selector
                      </span>
                    </span>
                    <span className="tw-flex tw-shrink-0 tw-items-center tw-gap-2 tw-font-medium tw-text-twprimary">
                      <span className="tw-hidden sm:tw-inline">Start</span>
                    </span>
                  </Link>
                )}
                <div>
                  {this.renderApplicationFilters(availableApplications, filteredAvailableApplications)}
                  <div className="tw-overflow-hidden tw-rounded-md tw-border tw-border-gray-200 tw-bg-white">
                    {this.renderAvailableApplicationRows(
                      availableApplications,
                      filteredAvailableApplications,
                      clientUsername,
                      clientName,
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="tw-mt-3 tw-flex tw-w-full tw-appearance-none tw-items-center tw-justify-between tw-gap-4 tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-shadow-sm hover:tw-bg-blue-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                  onClick={this.openUploadModal}
                >
                  <span className="tw-font-medium tw-text-gray-900">Upload PDF</span>
                  <span className="tw-flex tw-shrink-0 tw-items-center tw-gap-2 tw-text-twprimary">
                    <span className="tw-hidden sm:tw-inline">Upload</span>
                  </span>
                </button>
              </div>
            )}
          </div>
          {uploadModalOpen && (
            <div
              className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
              onClick={() => { if (!uploadSubmitting) this.setState({ uploadModalOpen: false }); }}
              role="presentation"
            >
              <div
                className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4">
                  Upload Application PDF
                </h5>
                {uploadError && <div className="alert alert-danger py-2">{uploadError}</div>}
                {this.renderModalClientPicker(uploadSubmitting)}
                <label htmlFor="upload-application-name" className="form-label fw-semibold">
                  Application name
                </label>
                <input
                  id="upload-application-name"
                  type="text"
                  className="form-control"
                  value={uploadApplicationName}
                  onChange={(e) => this.setState({ uploadApplicationName: e.target.value })}
                  disabled={uploadSubmitting}
                />
                <label htmlFor="upload-application-file" className="form-label fw-semibold tw-mt-3">
                  PDF file
                </label>
                <input
                  id="upload-application-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="form-control"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.setState({ uploadFile: e.target.files?.[0] || null });
                  }}
                  disabled={uploadSubmitting}
                />
                {uploadFile && (
                  <div className="tw-text-sm tw-text-gray-600 tw-mt-2">{uploadFile.name}</div>
                )}
                <div className="tw-flex tw-justify-end tw-gap-3 tw-mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => this.setState({ uploadModalOpen: false })}
                    disabled={uploadSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleUploadApplication}
                    disabled={uploadSubmitting || !modalClientUsername || !uploadApplicationName.trim() || !uploadFile}
                  >
                    {uploadSubmitting ? 'Uploading...' : 'Create application'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {deleteTargetApplication && (
            <div
              className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
              onClick={() => this.setState({ deleteTargetApplication: null })}
              role="presentation"
            >
              <div
                className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">
                  Delete Application
                </h5>
                <p className="tw-text-gray-600 tw-mb-4">
                  Are you sure you want to delete{' '}
                  <span className="tw-font-semibold">
                    {deleteTargetApplication.filename?.replace(/\.pdf$/i, '')}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="tw-flex tw-justify-end tw-gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => this.setState({ deleteTargetApplication: null })}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={this.confirmDeleteApplication}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {renameTarget && (
            <div
              className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
              onClick={() => { if (!isRenaming) this.closeRenameModal(); }}
              role="presentation"
            >
              <div
                className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4">
                  Rename Application
                </h5>
                <input
                  type="text"
                  className="form-control"
                  value={renameValue}
                  onChange={(e) => this.setState({ renameValue: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter' && renameValue.trim()) this.confirmRename(); }}
                  disabled={isRenaming}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
                <div className="tw-flex tw-justify-end tw-gap-3 tw-mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={this.closeRenameModal}
                    disabled={isRenaming}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.confirmRename}
                    disabled={isRenaming || !renameValue.trim()}
                  >
                    {isRenaming ? 'Renaming...' : 'Rename'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Route>
        <Route path="/applications/selector">
          {isClientUser || !clientUsername ? (
            <Redirect to="/applications" />
          ) : (
            <ApplicationSelectorFlow
              availableApplications={availableApplications}
              clientUsername={clientUsername}
              clientName={clientName}
            />
          )}
        </Route>
        <Route path="/applications/preview">
          <ApplicationPdfPreview
            editable={false}
            allowAttachmentEditing={false}
            canMail={!isClientUser}
            canEditPdf={!isClientUser}
          />
        </Route>
        <Route path="/applications/edit">
          <ApplicationPdfPreview
            editable={!isClientUser}
            allowAttachmentEditing={
              this.props.role === Role.Worker
              || this.props.role === Role.Admin
              || this.props.role === Role.Director
            }
            canMail={!isClientUser}
            canEditPdf={!isClientUser}
          />
        </Route>
        <Route path="/applications/send">
          {currentApplicationId && currentApplicationFilename
            ? (
              <Redirect
                to={{
                  pathname: '/applications/preview',
                  state: {
                    applicationId: currentApplicationId,
                    applicationFilename: currentApplicationFilename,
                    targetUser: currentApplicationUploader || '',
                    clientUsername: clientUsername || '',
                  },
                }}
              />
            )
            : <div />}
        </Route>
      </Switch>
    );
  }
}

export default withRouter(ViewApplications);
