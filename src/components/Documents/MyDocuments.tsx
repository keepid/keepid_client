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
}

type Props = OwnProps & RouteComponentProps;

interface State {
  pdfFiles: FileList | undefined;
  buttonState: string;
  currentDocumentId: string | undefined;
  currentDocumentName: string | undefined;
  currentUploadDate: string | undefined;
  currentUploader: string | undefined;
  currentUserRole: Role | undefined;
  currentDocumentFileType: FileType | undefined;
  currentDocumentTargetUser: string | undefined;
  currentDocumentIdCategory: string | undefined;
  documentData: any;
  deleteTargetDocument: any | null;
  renameTarget: any | null;
  renameValue: string;
  isRenaming: boolean;
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
      currentUserRole: undefined,
      currentDocumentFileType: undefined,
      currentDocumentTargetUser: undefined,
      currentDocumentIdCategory: undefined,
      documentData: [],
      deleteTargetDocument: null,
      renameTarget: null,
      renameValue: '',
      isRenaming: false,
    };
    this.getDocumentData = this.getDocumentData.bind(this);
    this.onViewDocument = this.onViewDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
  }

  static maxFilesExceeded(files, maxNumFiles) {
    return files.length > maxNumFiles;
  }

  resetDocumentId = () => {
    this.setState({ currentDocumentId: undefined });
    this.setState({ currentDocumentName: undefined });
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
    const { id, filename, uploadDate, uploader, idCategory } = row;
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
      currentDocumentFileType: fileType,
      currentDocumentTargetUser: targetUser,
      currentDocumentIdCategory: idCategory,
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

  static formatIdCategory(idCategory?: string) {
    if (!idCategory || idCategory === 'NONE') return 'Uncategorized';
    return idCategory.replace(/_/g, ' ');
  }

  static formatUploadDate(uploadDate?: string) {
    if (!uploadDate) return '';
    const parsedDate = new Date(uploadDate);
    if (Number.isNaN(parsedDate.getTime())) return uploadDate;
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
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

    fetch(`${getServerURL()}/get-files `, {
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

  nameFormatter = (row: any) => {
    const displayName = MyDocuments.getDisplayFileName(row.filename);
    return (
      <span
        className="tw-font-medium tw-text-gray-900 tw-block"
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
        }}
      >
        {displayName}
      </span>
    );
  };

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

    if (this.props.userRole === Role.Client && this.isStaffViewer()) {
      actions.push({
        label: 'Notify',
        icon: <MessageOutlinedIcon fontSize="small" />,
        onClick: () => {
          this.props.history.push({
            pathname: `/home/notify-client/${this.props.username}`,
            state: {
              clientName: this.props.clientName,
              prefilledIdCategory: row.idCategory,
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
      currentDocumentTargetUser,
      currentDocumentFileType,
      currentDocumentIdCategory,
      deleteTargetDocument,
      renameTarget,
      renameValue,
      isRenaming,
    } = this.state;
    const safeDocuments = Array.isArray(documentData) ? documentData : [];

    const columns: DataTableColumn[] = [
      {
        field: 'filename',
        headerName: 'Name',
        renderCell: (row: any) => this.nameFormatter(row),
      },
      {
        field: 'idCategory',
        headerName: 'ID Type',
        align: 'center',
        width: '20%',
        renderCell: (row: any) => MyDocuments.formatIdCategory(row.idCategory),
      },
      {
        field: 'uploadDate',
        headerName: 'Date Uploaded',
        sortable: true,
        sortType: 'date',
        width: '18%',
        renderCell: (row: any) => MyDocuments.formatUploadDate(row.uploadDate),
      },
      {
        field: 'actions',
        headerName: '',
        align: 'right',
        width: '48px',
        renderCell: (row: any) => (
          <RowActionMenu actions={this.getRowActions(row)} />
        ),
      },
    ];

    return (
      <Switch>
        <Route path="/my-documents">
          {currentDocumentId && currentDocumentName ? (
            <ViewDocument
              userRole={currentUserRole}
              viewerRole={this.props.viewerRole}
              documentId={currentDocumentId}
              documentName={currentDocumentName}
              documentDate={currentUploadDate}
              documentUploader={currentUploader}
              targetUser={currentDocumentTargetUser}
              fileType={currentDocumentFileType}
              idCategory={currentDocumentIdCategory}
              clientName={this.props.clientName}
              onDownloadCurrentDocument={() => this.handleFileDownload({
                id: currentDocumentId,
                filename: currentDocumentName,
                uploader: currentDocumentTargetUser,
              })}
              onRequestDeleteCurrentDocument={() => this.requestDeleteDocument({
                id: currentDocumentId,
                filename: currentDocumentName,
                idCategory: currentDocumentIdCategory,
              })}
              resetDocumentId={this.resetDocumentId}
            />
          ) : (
            <div className="container">
            <Helmet>
              <title>{this.props.clientName ? `${this.props.clientName}'s Documents` : 'My Documents'}</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron-fluid mt-5">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <h1 className="display-4 mb-0">
                  {this.props.clientName ? `${this.props.clientName}'s Documents` : 'My Documents'}
                </h1>
                <DocumentsInlineUpload
                  targetUser={username}
                  alert={this.props.alert}
                  onUploadComplete={() => this.getDocumentData()}
                />
              </div>
            </div>

            <div className="d-flex flex-row bd-highlight mb-3 pt-5">
              <div className="w-100 pd-3">
                <DataTable
                  columns={columns}
                  data={safeDocuments}
                  keyField="id"
                  emptyMessage={this.props.clientName ? `No documents for ${this.props.clientName}` : 'No documents found'}
                  searchPlaceholder="Search documents..."
                  searchFields={['filename', 'idCategory', 'uploadDate']}
                  pageSize={20}
                  defaultSortField="uploadDate"
                  defaultSortDirection="desc"
                  onRowClick={this.handleRowClick}
                />
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
                    {MyDocuments.getDisplayFileName(deleteTargetDocument.filename)}
                  </span>
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
