import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import React, { Component, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Role from '../../static/Role';
import { canUseApplications, canUseClientNotifications } from '../../utils/featureAccess';
import DataTable, { DataTableColumn } from '../BaseComponents/DataTable';
import RowActionMenu, { RowAction } from '../BaseComponents/RowActionMenu';
import DocumentsInlineUpload from './DocumentsInlineUpload';
import DocumentViewer from './DocumentViewer';
import ViewDocument from './ViewDocument';

interface OwnProps {
  alert: any;
  userRole: Role;
  viewerRole?: Role;
  username: string;
  clientName?: string;
  viewerUsername?: string;
  viewerName?: string;
  organizationName?: string;
}

type Props = OwnProps & RouteComponentProps;

interface State {
  pdfFiles: FileList | undefined;
  buttonState: string;
  currentDocumentId: string | undefined;
  currentDocumentName: string | undefined;
  currentUploadDate: string | undefined;
  currentUploader: string | undefined;
  currentUploaderName: string | undefined;
  currentUserRole: Role | undefined;
  currentDocumentFileType: FileType | undefined;
  currentDocumentTargetUser: string | undefined;
  currentDocumentIdCategory: string | undefined;
  currentDocumentIdCategoryDisplay: string | undefined;
  currentDocumentCustomIdCategory: string | undefined;
  documentData: any;
  deleteTargetDocument: any | null;
  renameTarget: any | null;
  renameValue: string;
  isRenaming: boolean;
  showAllDocuments: boolean;
}

interface PDFProps {
  pdfFile: File;
}

const MAX_NUM_OF_FILES: number = 5;

function RenderPDF(props: PDFProps): React.ReactElement {
  const [showResults, setShowResults] = useState(false);
  const { pdfFile } = props;
  return (
    <li className="mt-3">
      <div className="row">
        <button
          className="btn btn-outline-primary btn-sm mr-3"
          type="button"
          onClick={() => setShowResults(!showResults)}
        >
          {showResults ? 'Hide' : 'View'}
        </button>
        <p>{pdfFile.name}</p>
      </div>
      {showResults ? (
        <div className="row mt-3 w-100">
          <DocumentViewer pdfFile={pdfFile} />
        </div>
      ) : (
        <div />
      )}
    </li>
  );
}

class MyDocuments extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleFileDownload = this.handleFileDownload.bind(this);
    this.handleChangeFilePrint = this.handleChangeFilePrint.bind(this);
    this.handleFilePrint = this.handleFilePrint.bind(this);
    this.state = {
      pdfFiles: undefined,
      buttonState: '',
      currentDocumentId: undefined,
      currentDocumentName: undefined,
      currentUploadDate: undefined,
      currentUploader: undefined,
      currentUploaderName: undefined,
      currentUserRole: undefined,
      currentDocumentFileType: undefined,
      currentDocumentTargetUser: undefined,
      currentDocumentIdCategory: undefined,
      currentDocumentIdCategoryDisplay: undefined,
      currentDocumentCustomIdCategory: undefined,
      documentData: [],
      deleteTargetDocument: null,
      renameTarget: null,
      renameValue: '',
      isRenaming: false,
      showAllDocuments: false,
    };
    this.getDocumentData = this.getDocumentData.bind(this);
    this.onViewDocument = this.onViewDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
  }

  static maxFilesExceeded(files, maxNumFiles) {
    return files.length > maxNumFiles;
  }

  resetDocumentId = () => {
    this.setState({
      currentDocumentId: undefined,
      currentDocumentName: undefined,
      currentUploaderName: undefined,
      currentDocumentIdCategory: undefined,
      currentDocumentIdCategoryDisplay: undefined,
      currentDocumentCustomIdCategory: undefined,
    });
  };

  static fileNamesUnique(files) {
    const fileNames: string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const fileName = files[i].name;
      fileNames.push(fileName);
    }

    return fileNames.length === new Set(fileNames).size;
  }

  handleFileDownload(row: any) {
    const { userRole, alert } = this.props;
    const documentId = row.id;
    const documentName = row.filename;

    let fileType; let
      targetUser;
    if (
      userRole === Role.Worker ||
        userRole === Role.Admin ||
        userRole === Role.Director
    ) {
      fileType = FileType.APPLICATION_PDF;
      targetUser = row.uploader;
    } else if (userRole === Role.Client) {
      fileType = FileType.IDENTIFICATION_PDF;
      targetUser = this.props.username;
    } else {
      fileType = undefined;
    }

    fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        fileType,
        targetUser,
      }),
    })
      .then((response) => response.blob())
      .then((response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((_error) => {
        alert.show('Error Fetching File');
      });
  }

  handleChangeFilePrint(event: any, rowIndex: number) {
    event.preventDefault();
    const { files } = event.target;

    this.setState(
      {
        pdfFiles: files,
      },
      () => this.handleFilePrint(rowIndex),
    );
  }

  handleFilePrint(rowIndex: number) {
    const { userRole, alert } = this.props;
    const { documentData } = this.state;

    const documentId = documentData[rowIndex].id;
    const documentName = documentData[rowIndex].filename;

    const targetUser = this.props.username;

    let fileType;
    if (
      userRole === Role.Worker ||
        userRole === Role.Admin ||
        userRole === Role.Director
    ) {
      fileType = FileType.APPLICATION_PDF;
    } else if (userRole === Role.Client) {
      fileType = FileType.IDENTIFICATION_PDF;
    } else {
      fileType = undefined;
    }

    fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        fileType,
        targetUser,
      }),
    })
      .then((response) => response.blob())
      .then((response) => {
        const pdfFile = new File([response], documentName, {
          type: 'application/pdf',
        });
      })
      .catch((_error) => {
        alert.show('Error Fetching File');
      });
  }

  componentDidMount() {
    this.getDocumentData();
  }

  handleRowClick = (row: any) => {
    this.onViewDocument(null, row);
  };

  onViewDocument(event: any, row: any) {
    const {
      id,
      filename,
      uploadDate,
      uploader,
      idCategory,
      idCategoryDisplay,
      customIdCategory,
    } = row;
    const { userRole } = this.props;

    let fileType; let
      targetUser;
    if (
      userRole === Role.Worker ||
        userRole === Role.Admin ||
        userRole === Role.Director
    ) {
      fileType = FileType.APPLICATION_PDF;
      targetUser = row.uploader;
    } else if (userRole === Role.Client) {
      fileType = FileType.IDENTIFICATION_PDF;
      targetUser = this.props.username;
    } else {
      fileType = undefined;
    }

    this.setState({
      currentDocumentId: id,
      currentDocumentName: filename,
      currentUploadDate: uploadDate,
      currentUploader: uploader,
      currentUploaderName: MyDocuments.getUploaderDisplayName(row),
      currentDocumentFileType: fileType,
      currentDocumentTargetUser: targetUser,
      currentDocumentIdCategory: idCategory,
      currentDocumentIdCategoryDisplay: idCategoryDisplay,
      currentDocumentCustomIdCategory: customIdCategory,
    });
  }

  requestDeleteDocument = (row: any) => {
    this.setState({ deleteTargetDocument: row });
  };

  closeDeleteModal = () => {
    this.setState({ deleteTargetDocument: null });
  };

  confirmDeleteDocument = () => {
    const { deleteTargetDocument } = this.state;
    if (!deleteTargetDocument) return;

    const documentId = deleteTargetDocument.id;
    const { userRole } = this.props;
    const targetUser = this.props.username;

    let fileType;
    if (
      userRole === Role.Worker ||
      userRole === Role.Admin ||
      userRole === Role.Director
    ) {
      fileType = FileType.APPLICATION_PDF;
    } else if (userRole === Role.Client) {
      fileType = FileType.IDENTIFICATION_PDF;
    } else {
      fileType = undefined;
    }

    fetch(`${getServerURL()}/delete-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        fileType,
        targetUser,
      }),
    })
      .then((response) => response.json())
      .then((_responseJSON) => {
        this.getDocumentData();
        this.setState({ deleteTargetDocument: null });
        this.resetDocumentId();
      });
  };

  deleteDocument(event, row) {
    event.preventDefault();
    this.requestDeleteDocument(row);
  }

  static getDisplayFileName(fileName?: string) {
    if (!fileName) return '';
    return fileName.replace(/\.pdf$/i, '');
  }

  static toTitleCase(value: string) {
    return value
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  static getDocumentTypeLabel(row: any) {
    const custom = typeof row?.customIdCategory === 'string' ? row.customIdCategory.trim() : '';
    if (custom) return custom;

    const display = typeof row?.idCategoryDisplay === 'string' ? row.idCategoryDisplay.trim() : '';
    if (display && display.toUpperCase() !== 'NONE') return display;

    const idCategory = typeof row?.idCategory === 'string' ? row.idCategory.trim() : '';
    if (!idCategory || idCategory.toUpperCase() === 'NONE') return 'Uncategorized';
    if (idCategory.includes('_')) return MyDocuments.toTitleCase(idCategory.replace(/_/g, ' '));
    return idCategory;
  }

  static getDocumentTypeKey(row: any) {
    const custom = typeof row?.customIdCategory === 'string' ? row.customIdCategory.trim() : '';
    if (custom) return `custom:${custom.toLowerCase()}`;
    const idCategory = typeof row?.idCategory === 'string' ? row.idCategory.trim() : '';
    const display = typeof row?.idCategoryDisplay === 'string' ? row.idCategoryDisplay.trim() : '';
    const base = idCategory || display || 'NONE';
    return `type:${base.toUpperCase()}`;
  }

  static formatUploadDate(uploadDate?: string) {
    if (!uploadDate) return '';
    const parsedDate = new Date(uploadDate);
    if (Number.isNaN(parsedDate.getTime())) return uploadDate;
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  static getUploaderDisplayName(row: any) {
    const displayName = typeof row?.uploaderName === 'string' ? row.uploaderName.trim() : '';
    if (displayName) return displayName;
    return row?.uploader || '';
  }

  getDocumentData() {
    const { userRole } = this.props;
    this.setState({ currentUserRole: userRole });

    let targetUser;
    if (this.props.username !== '') {
      targetUser = this.props.username;
    }

    let fileType;
    if (
      userRole === Role.Worker ||
        userRole === Role.Admin ||
        userRole === Role.Director
    ) {
      fileType = FileType.APPLICATION_PDF;
    } else if (userRole === Role.Client) {
      fileType = FileType.IDENTIFICATION_PDF;
    } else {
      fileType = undefined;
    }

    fetch(`${getServerURL()}/get-files`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileType,
        targetUser,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { documents } = responseJSON;
        this.setState({ documentData: Array.isArray(documents) ? documents : [] });
      });
  }

  isStaffViewer = () =>
    this.props.viewerRole === Role.Worker
    || this.props.viewerRole === Role.Admin
    || this.props.viewerRole === Role.Director;

  shouldUseClientUi = () =>
    this.props.userRole === Role.Client && !this.isStaffViewer();

  openRenameModal = (row: any) => {
    this.setState({
      renameTarget: row,
      renameValue: MyDocuments.getDisplayFileName(row.filename),
    });
  };

  closeRenameModal = () => {
    this.setState({ renameTarget: null, renameValue: '', isRenaming: false });
  };

  confirmRename = () => {
    const { renameTarget, renameValue } = this.state;
    if (!renameTarget || !renameValue.trim()) return;

    const { alert } = this.props;
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
          this.getDocumentData();
        } else {
          alert.show(`Failed to rename: ${json?.message || 'Unknown error'}`, { type: 'error' });
          this.setState({ isRenaming: false });
        }
      })
      .catch((err) => {
        alert.show(`Failed to rename: ${err}`, { type: 'error' });
        this.setState({ isRenaming: false });
      });
  };

  getRowActions = (row: any): RowAction[] => {
    const actions: RowAction[] = [
      {
        label: 'Download',
        icon: <FileDownloadOutlinedIcon fontSize="small" />,
        onClick: () => this.handleFileDownload(row),
      },
    ];

    if (this.isStaffViewer()) {
      actions.push({
        label: 'Rename',
        icon: <DriveFileRenameOutlineIcon fontSize="small" />,
        onClick: () => this.openRenameModal(row),
      });
    }

    if (
      this.props.userRole === Role.Client
      && this.isStaffViewer()
      && canUseClientNotifications(
        this.props.viewerRole,
        this.props.organizationName,
        this.props.viewerUsername,
      )
    ) {
      actions.push({
        label: 'Notify',
        icon: <MessageOutlinedIcon fontSize="small" />,
        onClick: () => {
          this.props.history.push({
            pathname: `/home/notify-client/${this.props.username}`,
            state: {
              clientName: this.props.clientName,
              prefilledIdCategory: MyDocuments.getDocumentTypeLabel(row),
            },
          });
        },
      });
    }

    actions.push({
      label: 'Delete',
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: () => this.requestDeleteDocument(row),
      danger: true,
    });

    return actions;
  };

  render() {
    const { currentUserRole } = this.state;

    const { userRole, username } = this.props;
    const {
      currentDocumentId,
      currentDocumentName,
      documentData,
      currentUploadDate,
      currentUploader,
      currentUploaderName,
      currentDocumentTargetUser,
      currentDocumentFileType,
      currentDocumentIdCategory,
      currentDocumentIdCategoryDisplay,
      currentDocumentCustomIdCategory,
      deleteTargetDocument,
      renameTarget,
      renameValue,
      isRenaming,
      showAllDocuments,
    } = this.state;
    const shouldUseClientUi = this.shouldUseClientUi();
    const safeDocuments = Array.isArray(documentData)
      ? [...documentData].sort((a: any, b: any) => {
        const aTime = new Date(a.uploadDate || '').getTime();
        const bTime = new Date(b.uploadDate || '').getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      })
      : [];

    const mostRecentByType = new Map<string, any>();
    safeDocuments.forEach((row: any) => {
      const typeKey = MyDocuments.getDocumentTypeKey(row);
      if (!mostRecentByType.has(typeKey)) {
        mostRecentByType.set(typeKey, row);
      }
    });

    const latestDocuments = Array.from(mostRecentByType.values());
    const allDocuments = safeDocuments;

    const allDocumentsColumns: DataTableColumn[] = [
      {
        field: 'idType',
        headerName: 'ID Type',
        renderCell: (row: any) => (
          <span className="tw-font-medium tw-text-gray-900">
            {MyDocuments.getDocumentTypeLabel(row)}
          </span>
        ),
      },
      {
        field: 'uploadDate',
        headerName: 'Uploaded',
        align: 'center',
        width: '20%',
        sortType: 'date',
        sortable: true,
        renderCell: (row: any) => MyDocuments.formatUploadDate(row.uploadDate),
      },
      {
        field: 'uploader',
        headerName: 'Uploaded By',
        align: 'center',
        width: '20%',
        renderCell: (row: any) => MyDocuments.getUploaderDisplayName(row),
      },
      {
        field: 'actions',
        headerName: shouldUseClientUi ? 'Actions' : '',
        align: 'right',
        width: shouldUseClientUi ? '26%' : '48px',
        hideOnMobile: true,
        renderCell: (row: any) => (
          shouldUseClientUi ? (
            <div className="tw-flex tw-justify-end tw-gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  this.handleFileDownload(row);
                }}
              >
                Download
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  this.requestDeleteDocument(row);
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
    ];
    const mostRecentColumns: DataTableColumn[] = allDocumentsColumns.filter(
      (column) => column.field !== 'uploader',
    );
    const canAccessApplications = canUseApplications(
      this.props.viewerRole || this.props.userRole,
      this.props.organizationName,
      this.props.viewerUsername || this.props.username,
    );

    return (
      <Switch>
        <Route path="/my-documents">
          {currentDocumentId && currentDocumentName ? (
            <ViewDocument
              userRole={currentUserRole}
              viewerRole={this.props.viewerRole}
              viewerUsername={this.props.viewerUsername}
              organizationName={this.props.organizationName}
              documentId={currentDocumentId}
              documentName={currentDocumentName}
              documentDate={currentUploadDate}
              documentUploader={currentUploader}
              documentUploaderName={currentUploaderName}
              targetUser={currentDocumentTargetUser}
              fileType={currentDocumentFileType}
              idCategory={currentDocumentIdCategory}
              idCategoryDisplay={currentDocumentIdCategoryDisplay}
              customIdCategory={currentDocumentCustomIdCategory}
              clientName={this.props.clientName}
              onDownloadCurrentDocument={() => this.handleFileDownload({
                id: currentDocumentId,
                filename: currentDocumentName,
                uploader: currentUploader,
              })}
              onRequestDeleteCurrentDocument={() => this.requestDeleteDocument({
                id: currentDocumentId,
                filename: currentDocumentName,
                idCategory: currentDocumentIdCategory,
                idCategoryDisplay: currentDocumentIdCategoryDisplay,
                customIdCategory: currentDocumentCustomIdCategory,
                uploadDate: currentUploadDate,
              })}
              resetDocumentId={this.resetDocumentId}
            />
          ) : (
            <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
            <Helmet>
              <title>{this.props.clientName ? `${this.props.clientName}'s Documents` : 'My Documents'}</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron-fluid mt-5">
              <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mb-4">
                <button
                  type="button"
                  className="btn btn-primary mr-2"
                  onClick={() => this.props.history.goBack()}
                >
                  <i className="fas fa-chevron-left" /> Back
                </button>
                {this.isStaffViewer() && (
                  <button
                    type="button"
                    className="btn btn-primary mr-2"
                    onClick={() => this.props.history.push(`/profile/${username}`)}
                  >
                    Profile
                  </button>
                )}
                {this.isStaffViewer() && canAccessApplications && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => this.props.history.push({
                      pathname: '/applications',
                      state: {
                        clientUsername: username,
                        clientName: this.props.clientName,
                      },
                    })}
                  >
                    Applications
                  </button>
                )}
              </div>
              <div className="mb-4">
                <DocumentsInlineUpload
                  targetUser={username}
                  alert={this.props.alert}
                  onUploadComplete={() => this.getDocumentData()}
                  collapsible
                  collapsibleHeaderStart={(
                    <h1 className="display-4 mb-0">
                      {this.props.clientName ? `${this.props.clientName}'s Documents` : 'My Documents'}
                    </h1>
                  )}
                  viewerUsername={this.isStaffViewer() ? this.props.viewerUsername : undefined}
                  viewerRole={this.isStaffViewer() ? this.props.viewerRole : undefined}
                  viewerName={this.isStaffViewer() ? this.props.viewerName : undefined}
                  organizationName={this.isStaffViewer() ? this.props.organizationName : undefined}
                  clientName={this.props.clientName}
                />
              </div>
            </div>

            <div className="d-flex flex-row bd-highlight mb-3 pt-5">
              <div className="w-100 pd-3">
                <h4 className="mb-3">Most Recent</h4>
                <DataTable
                  columns={mostRecentColumns}
                  data={latestDocuments}
                  keyField="id"
                  emptyMessage={this.props.clientName ? `No documents for ${this.props.clientName}` : 'No documents found'}
                  showSearch={false}
                  pageSize={20}
                  onRowClick={this.handleRowClick}
                />
                <div className="tw-mt-6">
                  {shouldUseClientUi ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => this.setState((prevState) => ({
                          showAllDocuments: !prevState.showAllDocuments,
                        }))}
                      >
                        {showAllDocuments ? 'Hide all documents' : 'Show all documents'}
                      </button>
                      {showAllDocuments && (
                        <div className="tw-mt-3">
                          <DataTable
                            columns={allDocumentsColumns}
                            data={allDocuments}
                            keyField="id"
                            emptyMessage="No documents found."
                            showSearch={false}
                            pageSize={20}
                            onRowClick={this.handleRowClick}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <details>
                      <summary className="tw-cursor-pointer tw-font-medium tw-text-gray-800">
                        All Documents
                      </summary>
                      <div className="tw-mt-3">
                        <DataTable
                          columns={allDocumentsColumns}
                          data={allDocuments}
                          keyField="id"
                          emptyMessage="No documents found."
                          showSearch={false}
                          pageSize={20}
                          onRowClick={this.handleRowClick}
                        />
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}
          {deleteTargetDocument && (
            <div
              className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
              onClick={this.closeDeleteModal}
              role="presentation"
            >
              <div
                className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">
                  Delete Document
                </h5>
                <p className="tw-text-gray-600 tw-mb-4">
                  Are you sure you want to delete{' '}
                  <span className="tw-font-semibold">
                    {MyDocuments.getDocumentTypeLabel(deleteTargetDocument)}
                  </span>
                  {deleteTargetDocument.uploadDate ? (
                    <>
                      {' '}uploaded on {MyDocuments.formatUploadDate(deleteTargetDocument.uploadDate)}
                    </>
                  ) : null}
                  ? This action cannot be undone.
                </p>
                <div className="tw-flex tw-justify-end tw-gap-3">
                  <button type="button" className="btn btn-outline-dark" onClick={this.closeDeleteModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={this.confirmDeleteDocument}>
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
                  Rename Document
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
      </Switch>
    );
  }
}

export default withRouter(withAlert()(MyDocuments) as any) as any;
