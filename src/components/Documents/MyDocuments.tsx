import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component, useState } from 'react';
import { withAlert } from 'react-alert';
import { ButtonGroup } from 'react-bootstrap';
import ToolkitProvider, {
  Search,
} from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Role from '../../static/Role';
import Table from '../BaseComponents/Table';
import DocumentViewer from './DocumentViewer';
import ViewDocument from './ViewDocument';

const { SearchBar } = Search;

interface Props {
  alert: any;
  userRole: Role;
  username: string;
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
  documentData: any;
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
    this.handleChangeFileDownload = this.handleChangeFileDownload.bind(this);
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
      documentData: [],
    };
    this.getDocumentData = this.getDocumentData.bind(this);
    this.onViewDocument = this.onViewDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
    this.ButtonFormatter = this.ButtonFormatter.bind(this);
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

  handleChangeFileDownload(event: any, row: any) {
    event.preventDefault();
    const { files } = event.target;

    this.setState(
      {
        pdfFiles: files,
      },
      () => this.handleFileDownload(row),
    );
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
    const { id, filename, uploadDate, uploader } = row;
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
    });
  }

  deleteDocument(event, row) {
    event.preventDefault();
    const documentId = row.id;
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
        console.log(responseJSON);
        this.setState({ documentData: documents });
      });
  }

  ButtonFormatter = (cell: any, row: any, rowIndex) => (
    // to get the unique id of the document, you need to set a hover state which stores the document id of the row
    // then in this function you can then get the current hover document id and do an action depending on the document id
    <ButtonGroup className="tw-flex tw-flex-col lg:tw-flex-row tw-space-y-2 lg:tw-space-y-0 lg:tw-space-x-2">
      <button
        type="button"
        onClick={(event) => this.onViewDocument(event, row)}
        className="btn btn-outline-info btn-sm tw-w-full lg:tw-w-auto"
      >
        View
      </button>
      <button
        type="button"
        onClick={(event) => this.handleChangeFileDownload(event, row)}
        className="btn btn-outline-success btn-sm tw-w-full lg:tw-w-auto"
      >
        Download
      </button>
      <button
        type="button"
        onClick={(event) => this.deleteDocument(event, row)}
        className="btn btn-outline-danger btn-sm tw-w-full lg:tw-w-auto"
      >
        Delete
      </button>
    </ButtonGroup>
  );

  tableCols = [
    {
      dataField: 'filename',
      text: 'File Name',
      sort: true,
    },
    {
      dataField: 'uploadDate',
      text: 'Date Uploaded',
      sort: true,
      sortFunc: (a, b, order) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        // @ts-ignore
        return order === 'desc' ? dateA - dateB : dateB - dateA;
      },
    },
    {
      dataField: 'idCategory',
      text: 'ID Type',
      sort: true,
    },
    {
      dataField: 'actions',
      text: 'Actions',
      formatter: this.ButtonFormatter,
    },
  ];

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
    } = this.state;

    return (
      <Switch>
        <Route path="/my-documents">
          {currentDocumentId && currentDocumentName ? (
            <ViewDocument
              userRole={currentUserRole}
              documentId={currentDocumentId}
              documentName={currentDocumentName}
              documentDate={currentUploadDate}
              documentUploader={currentUploader}
              targetUser={currentDocumentTargetUser}
              fileType={currentDocumentFileType}
              resetDocumentId={this.resetDocumentId}
            />
          ) : (
            <div className="container">
            <Helmet>
              <title>My Documents</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron-fluid mt-5">
              <h1 className="display-4">My Documents</h1>
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
                <ToolkitProvider
                  keyField="id"
                  data={documentData}
                  columns={this.tableCols}
                  search
                >
                  {(props) => (
                    <div>
                      <SearchBar {...props.searchProps} />
                      <hr />
                      <Table
                        data={documentData}
                        columns={this.tableCols}
                        emptyInfo={{ description: 'No documents found' }}
                        defaultSorted={[
                          { dataField: 'uploadDate', order: 'asc' },
                        ]}
                      />
                    </div>
                  )}
                </ToolkitProvider>
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
