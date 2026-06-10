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
import DataTable, { DataTableColumn } from '../BaseComponents/DataTable';
import RowActionMenu, { RowAction } from '../BaseComponents/RowActionMenu';
import ApplicationPdfPreview from './ApplicationPdfPreview';

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
}

interface Props {
  username: string,
  name: string,
  organization: string,
  role: Role,
}

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
  availableApplications: {
    lookupKey: string;
    type: string;
    state: string;
    situation: string;
    canStart: boolean;
  }[],
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

  getClientDisplayName = (row: DocumentInformation): string => {
    const fullName = row.clientName?.trim();
    if (fullName) return fullName;
    const first = row.clientFirstName?.trim() || '';
    const last = row.clientLastName?.trim() || '';
    const composed = `${first} ${last}`.trim();
    if (composed) return composed;
    return row.uploader || '-';
  };

  mapDocuments = (documents: DocumentInformation[]): DocumentInformation[] =>
    documents.map((doc) => ({
      ...doc,
      formattedUploadDate: this.formatUploadDate(doc.uploadDate || ''),
      formattedCreatedDate: this.formatUploadDate(doc.createdDate || doc.uploadDate || ''),
      clientName: this.getClientDisplayName(doc),
    }));

  parseLookupKey = (lookupKey: string): { type: string; state: string; situation: string } | null => {
    const parseWithDelimiter = (delimiter: string) => {
      const first = lookupKey.indexOf(delimiter);
      const second = lookupKey.indexOf(delimiter, first + 1);
      if (first < 0 || second < 0) return null;
      return {
        type: lookupKey.substring(0, first),
        state: lookupKey.substring(first + 1, second),
        situation: lookupKey.substring(second + 1),
      };
    };

    return parseWithDelimiter('$') || parseWithDelimiter('#');
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
          .filter((x) => x && x.lookupKey)
          .map((x) => {
            const lookupKey = String(x.lookupKey);
            const split = this.parseLookupKey(lookupKey);
            return {
              lookupKey,
              type: split?.type || String(x.type || ''),
              state: split?.state || String(x.state || ''),
              situation: split?.situation || String(x.situation || ''),
              canStart: Boolean(split?.type && split?.state && split?.situation),
            };
          });
        this.setState({ availableApplications: parsed });
      })
      .catch(() => {
        this.setState({ availableApplications: [] });
      });
  };

  loadDocuments = (targetUsername?: string, targetName?: string) => {
    const isWorkerView = Boolean(targetUsername && targetUsername.trim().length > 0);
    if (isWorkerView) {
      this.setState({ clientUsername: targetUsername, clientName: targetName });
    } else {
      this.setState({ clientUsername: undefined, clientName: undefined });
    }

    this.setState({ isLoadingDocuments: true, documentsError: null });
    // /list-applications returns a flat array of ApplicationListItemDto rows
    // (id, state, title, lookupKey, client*, timestamps, attachmentCount).
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
    } = this.state;
    const isClientUser = this.props.role === Role.Client;
    const pageTitle = isClientUser ? 'My Applications' : 'Applications';
    const applicationsOwner = (clientUsername === '' || clientUsername === undefined)
      ? ''
      : `${clientName || clientUsername || 'Client'}'s`;

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
        mobileWidth: '42%',
        nowrap: true,
        renderCell: (row) => row.formattedCreatedDate || '-',
      } as DataTableColumn<DocumentInformation>,
      {
        field: 'uploadDate',
        headerName: 'Last Updated',
        sortable: true,
        sortType: 'date',
        width: '18%',
        hideOnMobile: true,
        nowrap: true,
        renderCell: (row) => row.formattedUploadDate || '-',
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
          <div className="tw-container tw-mx-auto tw-px-4 tw-pt-12">
            <Helmet>
              <title>{pageTitle}</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="tw-mb-3">
              <Link to="/" className="btn btn-outline-secondary">
                <i className="fas fa-chevron-left me-1" aria-hidden />
                Back
              </Link>
            </div>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4">{applicationsOwner ? `${applicationsOwner} Applications` : pageTitle}</h1>
              </div>
            </div>
            <div className="container">
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
              <div className="container tw-mt-8">
                <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-mb-3">
                  <h2 className="h5 tw-mb-0">Start a new application</h2>
                </div>
                {availableApplications.length > 0 ? (
                  <ul className="tw-list-none tw-p-0 tw-m-0 tw-space-y-3">
                    {availableApplications.map((application) => (
                      <li key={application.lookupKey}>
                        <Link
                          to={{
                            pathname: '/applications/createnew',
                            state: {
                              clientUsername: clientUsername || '',
                              clientName: clientName || '',
                              presetApplication: {
                                lookupKey: application.lookupKey,
                                type: application.type,
                                state: application.state,
                                situation: application.situation,
                              },
                              startAtReview: application.canStart,
                            },
                          }}
                          className="tw-flex tw-items-center tw-justify-between tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-px-4 tw-py-3 tw-shadow-sm tw-no-underline hover:tw-border-twprimary hover:tw-bg-blue-50 hover:tw-shadow-md"
                        >
                          <div className="tw-flex tw-items-baseline tw-gap-3 tw-min-w-0">
                            <span className="tw-text-gray-900 tw-font-medium tw-shrink-0">
                              {application.type || 'Application'}
                            </span>
                            <span className="tw-text-sm tw-text-gray-600 tw-truncate">
                              {[application.state, application.situation]
                                .filter((value) => value && value.trim().length > 0)
                                .join(' — ') || 'Open application form'}
                            </span>
                          </div>
                          <i className="fas fa-chevron-right tw-text-gray-400 tw-text-sm tw-ml-3" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="alert alert-light border">
                    No quick-start registry options are available. You can still use the full form.
                  </div>
                )}
              </div>
            )}
          </div>
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
