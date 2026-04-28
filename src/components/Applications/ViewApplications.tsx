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
  filename: string,
  applicationDisplayName?: string,
  formattedUploadDate?: string,
  status?: string,
  applicationStatus?: string,
  applicationState?: string,
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

  getApplicationStatus = (row: DocumentInformation): string =>
    row.status || row.applicationStatus || row.applicationState || 'Ongoing';

  mapDocuments = (documents: DocumentInformation[]): DocumentInformation[] =>
    documents.map((doc) => ({
      ...doc,
      formattedUploadDate: this.formatUploadDate(doc.uploadDate || ''),
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
    fetch(`${getServerURL()}/get-files`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileType: FileType.APPLICATION_PDF,
        ...(isWorkerView ? { targetUser: targetUsername } : {}),
        annotated: true,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        const documents = Array.isArray(responseJSON.documents) ? responseJSON.documents : [];
        if (status === 'SUCCESS') {
          let newDocuments: DocumentInformation[] = [];
          for (let i = 0; i < documents.length; i += 1) {
            const row = documents[i];
            row.index = i;
            newDocuments.push(row);
          }
          newDocuments = this.mapDocuments(newDocuments);
          this.setState({
            documents: newDocuments,
            isLoadingDocuments: false,
            documentsError: null,
          });
          return;
        }
        this.setState({
          documents: [],
          isLoadingDocuments: false,
          documentsError: responseJSON.message || 'Could not load applications.',
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
    const { location } = this.props;
    const state = location.state as LocationState | undefined;
    const locationClientUsername = state?.clientUsername && state.clientUsername.trim().length > 0
      ? state.clientUsername
      : undefined;
    const locationClientName = state?.clientName;
    this.loadDocuments(locationClientUsername, locationClientName);
  }

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

    fetch(`${getServerURL()}/delete-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: deleteTargetApplication.id,
        fileType: FileType.APPLICATION_PDF,
        targetUser: deleteTargetApplication.uploader,
      }),
    })
      .then((response) => response.json())
      .then(() => {
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
    } = this.state;
    const isClientUser = this.props.role === Role.Client;
    const pageTitle = isClientUser ? 'My Applications' : 'Applications';
    const applicationsOwner = (clientUsername === '' || clientUsername === undefined)
      ? ''
      : `${clientName || clientUsername || 'Client'}'s`;

    const columns: DataTableColumn<DocumentInformation>[] = [
      {
        field: 'filename',
        headerName: 'Application Name',
        renderCell: (row) => this.getApplicationDisplayName(row),
      },
      {
        field: 'uploadDate',
        headerName: isClientUser ? 'Completed' : 'Upload Date',
        sortable: true,
        sortType: 'date',
        width: '20%',
        renderCell: (row) => row.formattedUploadDate || '-',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: '18%',
        renderCell: (row) => this.getApplicationStatus(row),
      },
      {
        field: 'actions',
        headerName: isClientUser ? 'Actions' : '',
        align: 'right',
        width: isClientUser ? '26%' : '48px',
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
      },
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
                defaultSortField="uploadDate"
                defaultSortDirection="desc"
                onRowClick={this.handleOpenApplication}
              />
            </div>
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
