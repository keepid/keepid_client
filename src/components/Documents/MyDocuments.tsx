import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Role from '../../static/Role';
import DocumentViewer from './DocumentViewer';
import ViewDocument from './ViewDocument';

interface Props {
  alert: any;
  userRole: Role;
  viewerRole?: Role;
  username: string;
  clientName?: string;
}

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
  searchTerm: string;
  currentPage: number;
}

interface PDFProps {
  pdfFile: File;
}

const MAX_NUM_OF_FILES: number = 5;
const DOCUMENTS_PER_PAGE = 20;

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
      searchTerm: '',
      currentPage: 1,
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

  onSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value, currentPage: 1 });
  };

  goToPreviousPage = () => {
    this.setState((prev) => ({ currentPage: Math.max(1, prev.currentPage - 1) }));
  };

  goToNextPage = (lastPage: number) => {
    this.setState((prev) => ({ currentPage: Math.min(lastPage, prev.currentPage + 1) }));
  };

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

  nameFormatter = (cell: any, row: any) => {
    const displayName = MyDocuments.getDisplayFileName(row.filename);
    return (
      <button
        type="button"
        onClick={(event) => this.onViewDocument(event, row)}
        className="tw-bg-transparent tw-border-0 tw-text-left tw-p-0 tw-w-full"
        title={displayName}
      >
        <span
          className="tw-font-medium tw-text-gray-900 tw-block"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {displayName}
        </span>
      </button>
    );
  };

  downloadIconButton = (row: any) => (
    <button
      type="button"
      onClick={() => this.handleFileDownload(row)}
      className="tw-bg-transparent tw-border-0 tw-text-gray-500 hover:tw-text-gray-700 tw-p-0"
      title="Download"
      aria-label="Download"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-4 tw-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0 4-4m-4 4-4-4m8 8H8" />
      </svg>
    </button>
  );

  deleteIconButton = (row: any) => (
    <button
      type="button"
      onClick={() => this.requestDeleteDocument(row)}
      className="tw-bg-transparent tw-border-0 tw-text-gray-500 hover:tw-text-red-600 tw-p-0"
      title="Delete"
      aria-label="Delete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-4 tw-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5h6v2m-7 4v7m4-7v7m4-7v7M8 21h8a1 1 0 0 0 1-1V7H7v13a1 1 0 0 0 1 1z" />
      </svg>
    </button>
  );

  notifyIconButton = (row: any) => {
    if (!(this.props.userRole === Role.Client && this.isStaffViewer())) {
      return null;
    }

    return (
      <Link
        to={{
          pathname: `/home/notify-client/${this.props.username}`,
          state: {
            clientName: this.props.clientName,
            prefilledIdCategory: row.idCategory,
          },
        }}
        className="tw-text-gray-500 hover:tw-text-gray-700"
        title="Notify Client"
        aria-label="Notify Client"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-4 tw-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8m-8 4h5m-7 6 1.5-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4z" />
        </svg>
      </Link>
    );
  };

  RowActions = (row: any) => (
    <div className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-flex-shrink-0">
      {this.downloadIconButton(row)}
      {this.deleteIconButton(row)}
      {this.notifyIconButton(row)}
    </div>
  );

  setLink() {
    if (this.props.userRole !== Role.Client) {
      return '/upload-document/';
    }
    return `/upload-document/${this.props.username}`;
  }

  render() {
    const { pdfFiles, buttonState, currentUserRole } = this.state;

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
      searchTerm,
      currentPage,
    } = this.state;
    const safeDocuments = Array.isArray(documentData) ? documentData : [];
    const filteredDocuments = safeDocuments.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      const filename = typeof row.filename === 'string' ? row.filename : '';
      const idCategory = typeof row.idCategory === 'string' ? row.idCategory : '';
      const uploadDate = typeof row.uploadDate === 'string' ? row.uploadDate : '';
      const haystack = `${filename} ${idCategory} ${uploadDate}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
    const totalCount = filteredDocuments.length;
    const lastPage = Math.max(1, Math.ceil(totalCount / DOCUMENTS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, lastPage);
    const startIndex = (safeCurrentPage - 1) * DOCUMENTS_PER_PAGE;
    const paginatedDocuments = filteredDocuments.slice(
      startIndex,
      startIndex + DOCUMENTS_PER_PAGE,
    );
    const showingStart = totalCount === 0 ? 0 : startIndex + 1;
    const showingEnd = totalCount === 0 ? 0 : Math.min(startIndex + DOCUMENTS_PER_PAGE, totalCount);

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
              <h1 className="display-4">{this.props.clientName ? `${this.props.clientName}'s Documents` : 'My Documents'}</h1>
              <p className="lead pt-3">
                You can edit, download, and delete your documents you currently
                have stored on Keep.id.
              </p>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mr-3"
              >
                <Link className="nav-link" to={this.setLink()}>
                  Upload Documents
                </Link>
              </button>
            </div>

            <div className="d-flex flex-row bd-highlight mb-3 pt-5">
              <div className="w-100 pd-3">
                <div className="tw-mb-4">
                  <input
                    type="text"
                    className="form-control"
                    value={searchTerm}
                    onChange={this.onSearchTermChange}
                    placeholder="Search documents..."
                  />
                </div>
                <div className="tw-border tw-border-gray-200 tw-rounded-md tw-overflow-hidden">
                  <div className="tw-grid tw-grid-cols-12 tw-items-center tw-px-4 tw-py-3 tw-bg-gray-50 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500">
                    <div className="tw-col-span-6">Name</div>
                    <div className="tw-col-span-3 tw-text-center">ID Type</div>
                    <div className="tw-col-span-2">Date Uploaded</div>
                    <div className="tw-col-span-1 tw-text-right">Actions</div>
                  </div>
                  {paginatedDocuments.length === 0 ? (
                    <div className="tw-p-6 tw-text-gray-500 tw-border-t tw-border-gray-200">No documents found</div>
                  ) : (
                    paginatedDocuments.map((row: any, index: number) => (
                      <div key={row.id || `${row.filename || 'doc'}-${index}`} className="tw-grid tw-grid-cols-12 tw-items-center tw-gap-3 tw-px-4 tw-py-4 tw-border-t tw-border-gray-200">
                        <div className="tw-col-span-6 tw-min-w-0">
                          {this.nameFormatter(null, row)}
                        </div>
                        <div className="tw-col-span-3 tw-text-sm tw-text-gray-700 tw-text-center">
                          {MyDocuments.formatIdCategory(row.idCategory)}
                        </div>
                        <div className="tw-col-span-2 tw-text-sm tw-text-gray-500">
                          {MyDocuments.formatUploadDate(row.uploadDate)}
                        </div>
                        <div className="tw-col-span-1">
                          {this.RowActions(row)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="tw-flex tw-items-center tw-justify-between tw-pt-3 tw-text-sm tw-text-gray-500">
                  <span>{`Showing ${showingStart}-${showingEnd} of ${totalCount}`}</span>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={this.goToPreviousPage}
                      disabled={safeCurrentPage <= 1}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => this.goToNextPage(lastPage)}
                      disabled={safeCurrentPage >= lastPage}
                    >
                      Next
                    </button>
                  </div>
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
        </Route>
      </Switch>
    );
  }
}

export default withAlert()(MyDocuments);
