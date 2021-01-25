import React, { Component, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Switch, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import uuid from 'react-uuid';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import DocumentViewer from './DocumentViewer';
import ViewDocument from './ViewDocument';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DragAndDrop from './DragAndDrop';

const { SearchBar } = Search;

interface Props {
  alert: any,
  userRole: Role,
  username: string,
}

interface State {
  pdfFiles: FileList | undefined,
  buttonState: string,
  currentDocumentId: string | undefined,
  currentDocumentName: string | undefined,
  documentData: any,
}

interface PDFProps {
  pdfFile: File
}

const MAX_NUM_OF_FILES: number = 5;

function RenderPDF(props: PDFProps): React.ReactElement {
  const [showResults, setShowResults] = useState(false);
  const { pdfFile } = props;
  return (
    <li className="mt-3">
      <div className="row">
        <button className="btn btn-outline-primary btn-sm mr-3" type="button" onClick={() => setShowResults(!showResults)}>{showResults ? 'Hide' : 'View'}</button>
        <p>{pdfFile.name}</p>
      </div>
      { showResults ? <div className="row mt-3 w-100"><DocumentViewer pdfFile={pdfFile} /></div> : <div /> }
    </li>
  );
}

class MyDocuments extends Component<Props, State> {
  static maxFilesExceeded(files, maxNumFiles) {
    return files.length > maxNumFiles;
  }

  static fileNamesUnique(files) {
    const fileNames : string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const fileName = files[i].name;
      fileNames.push(fileName);
    }

    return fileNames.length === new Set(fileNames).size;
  }

  constructor(props: Props) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.handleChangeFileDownload = this.handleChangeFileDownload.bind(this);
    this.handleFileDownload = this.handleFileDownload.bind(this);
    this.handleChangeFilePrint = this.handleChangeFilePrint.bind(this);
    this.handleFilePrint = this.handleFilePrint.bind(this);
    this.state = {
      pdfFiles: undefined,
      buttonState: '',
      currentDocumentId: undefined,
      currentDocumentName: undefined,
      documentData: [],
    };
    this.getDocumentData = this.getDocumentData.bind(this);
    this.onViewDocument = this.onViewDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
    this.ButtonFormatter = this.ButtonFormatter.bind(this);
  }

  componentDidMount() {
    this.getDocumentData();
  }

  onViewDocument(event: any, row: any) {
    const {
      id,
      filename,
    } = row;
    this.setState({
      currentDocumentId: id,
      currentDocumentName: filename,
    });
  }

  getDocumentData() {
    const {
      userRole,
    } = this.props;
    let pdfType;
    if (userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director) {
      pdfType = PDFType.APPLICATION;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION;
    } else {
      pdfType = undefined;
    }
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          documents,
        } = responseJSON;
        this.setState({ documentData: documents });
      });
  }

  ButtonFormatter = (cell: any, row: any, rowIndex) => (
    // to get the unique id of the document, you need to set a hover state which stores the document id of the row
    // then in this function you can then get the current hover document id and do an action depending on the document id
    <div>
      {/* <Link to="/my-documents/print">
        <button type="button" className="btn btn-outline-secondary ml-2 btn-sm">
          Print
        </button>
      </Link> */}
      {/*
      <button type="button" onClick={(event) => this.handleChangeFilePrint(event, rowIndex)} className="btn btn-outline-info ml-2 btn-sm">
        Print
      </button>
      */}
      <Link to="/my-documents/view">
        <button type="button" onClick={(event) => this.onViewDocument(event, row)} className="btn btn-outline-info btn-sm">
          View
        </button>
      </Link>
      <button type="button" onClick={(event) => this.handleChangeFileDownload(event, rowIndex)} className="btn btn-outline-success btn-sm ml-2">
        Download
      </button>
      <button type="button" onClick={(event) => this.deleteDocument(event, rowIndex)} className="btn btn-outline-danger btn-sm ml-2">
        Delete
      </button>

    </div>
  )

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    const {
      alert,
    } = this.props;
    const { files } = event.target;

    // check that the number of files uploaded doesn't exceed the maximum
    if (files.length > MAX_NUM_OF_FILES) {
      // eslint-disable-next-line no-param-reassign
      event.target.value = null; // discard selected files
      alert.show(`A maximum of ${MAX_NUM_OF_FILES} files can be uploaded at a time`);
      return;
    }

    // all validation met
    this.setState({
      pdfFiles: files,
    });
  }

  handleChangeFileDownload(event: any, rowIndex: number) {
    event.preventDefault();
    const { files } = event.target;

    this.setState({
      pdfFiles: files,
    }, () => this.handleFileDownload(rowIndex));
  }

  handleFileDownload(rowIndex: number) {
    const {
      userRole,
      alert,
    } = this.props;
    const { documentData } = this.state;

    const documentId = documentData[rowIndex].id;
    const documentName = documentData[rowIndex].filename;

    let pdfType;
    if (userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director) {
      pdfType = PDFType.APPLICATION;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION;
    } else {
      pdfType = undefined;
    }

    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        pdfType,
      }),
    }).then((response) => response.blob())
      .then((response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch(() => {
        alert.show('Error Fetching File');
      });
  }

  handleChangeFilePrint(event: any, rowIndex: number) {
    event.preventDefault();
    const { files } = event.target;

    this.setState({
      pdfFiles: files,
    }, () => this.handleFilePrint(rowIndex));
  }

  handleFilePrint(rowIndex: number) {
    const { userRole, alert } = this.props;
    const { documentData } = this.state;

    const documentId = documentData[rowIndex].id;
    const documentName = documentData[rowIndex].filename;

    let pdfType;
    if (userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director) {
      pdfType = PDFType.APPLICATION;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION;
    } else {
      pdfType = undefined;
    }

    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        pdfType,
      }),
    }).then((response) => response.blob())
      .then((response) => {
        // eslint-disable-next-line
        const pdfFile = new File([response], documentName, { type: 'application/pdf' });
        // pdfFile is not being used. keeping it here in case it is needed.
      }).catch(() => {
        alert.show('Error Fetching File');
      });
  }

  deleteDocument(event: any, rowIndex: number) {
    event.preventDefault();
    const { documentData } = this.state;
    const documentId = documentData[rowIndex].id;

    const {
      userRole,
    } = this.props;
    let pdfType;
    if (userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director) {
      pdfType = PDFType.APPLICATION;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION;
    } else {
      pdfType = undefined;
    }

    fetch(`${getServerURL()}/delete-document/`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        pdfType,
      }),
    }).then((response) => response.json())
      .then(() => {
        this.getDocumentData();
      });
  }

  submitForm(event: any) {
    const {
      userRole,
    } = this.props;

    this.setState({ buttonState: 'running' });
    event.preventDefault();
    const {
      pdfFiles,
    } = this.state;

    const {
      alert,
    } = this.props;

    if (pdfFiles) {
      // upload each pdf file
      for (let i = 0; i < pdfFiles.length; i += 1) {
        const pdfFile = pdfFiles[i];
        const formData = new FormData();
        formData.append('file', pdfFile, pdfFile.name);
        if (userRole === Role.Client) {
          formData.append('pdfType', PDFType.IDENTIFICATION);
        }
        if (userRole === Role.Director || userRole === Role.Admin) {
          formData.append('pdfType', PDFType.APPLICATION);
        }
        fetch(`${getServerURL()}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }).then((response) => response.json())
          .then((responseJSON) => {
            const {
              status,
            } = responseJSON;
            if (status === 'SUCCESS') {
              alert.show(`Successfully uploaded ${pdfFile.name}`);
              this.setState({
                buttonState: '',
                pdfFiles: undefined,
              }, () => this.getDocumentData());
            } else {
              alert.show(`Failure to upload ${pdfFile.name}`);
              this.setState({ buttonState: '' });
            }
          });
      }
    } else {
      alert.show('Please select a file');
      this.setState({ buttonState: '' });
    }
  }

  // disabling because requires moving parts in a seemingly impossible way
  // eslint-disable-next-line
  tableCols = [{
    dataField: 'filename',
    text: 'File Name',
    sort: true,
  }, {
    dataField: 'uploadDate',
    text: 'Date Uploaded',
    sort: true,
  },
  {
    dataField: 'uploader',
    text: 'Uploader',
    sort: true,
  },
  {
    dataField: 'actions',
    text: 'Actions',
    formatter: this.ButtonFormatter,
  }];

  render() {
    const {
      pdfFiles,
      buttonState,
    } = this.state;

    const {
      userRole,
    } = this.props;
    const {
      currentDocumentId,
      currentDocumentName,
      documentData,
    } = this.state;
    return (
      <Switch>
        <Route exact path="/my-documents">
          <div className="container">
            <Helmet>
              <title>View Documents</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron-fluid mt-5">
              <h1 className="display-5 font-weight-bold">My Documents</h1>
              <p className="lead pt-0 text-muted font-weight-bold">
                You can view, edit, print, and delete your documents you currently have stored on Keep.id.
              </p>
            </div>
            <ul className="list-unstyled">
              {
                pdfFiles && pdfFiles.length > 0 ? Array.from(pdfFiles).map((pdfFile) => <RenderPDF key={uuid()} pdfFile={pdfFile} />) : null
              }
            </ul>

            <div className="d-flex flex-row mb-3">
              <div className="w-100 pd-3">
                <ToolkitProvider
                  keyField="id"
                  data={documentData}
                  columns={this.tableCols}
                  search
                >
                  {
                    (props) => (
                      <div>
                        <div className="d-flex">
                          <div className="mr-auto">
                            <SearchBar {...props.searchProps} />
                          </div>
                          <div className="ml-auto">
                            <form onSubmit={this.submitForm}>
                              <div className="form-row">
                                <label htmlFor="potentialPdf" className="btn btn-filestack btn-widget">
                                  { pdfFiles && pdfFiles.length > 0 ? 'Choose New Files' : 'Upload File' }
                                  <input type="file" accept="application/pdf" id="potentialPdf" multiple onChange={this.handleChangeFileUpload} hidden />
                                </label>
                                { pdfFiles && pdfFiles.length > 0 ? (
                                  <button type="submit" className={`btn btn-success ld-ext-right ${buttonState}`}>
                                    Upload
                                    <div className="ld ld-ring ld-spin" />
                                  </button>
                                ) : null}
                              </div>
                            </form>
                          </div>
                        </div>
                        <hr />
                        <BootstrapTable
                          bootstrap4
                          hover
                          striped
                          noDataIndication="No Documents Present"
                          pagination={paginationFactory()}
                          {...props.baseProps}
                        />
                      </div>
                    )
                  }
                </ToolkitProvider>
              </div>
            </div>

          </div>
        </Route>
        <Route path="/my-documents/view">
          {currentDocumentId && currentDocumentName
            ? <ViewDocument userRole={userRole} documentId={currentDocumentId} documentName={currentDocumentName} /> : <div />}
        </Route>
      </Switch>
    );
  }
}

export default withAlert()(MyDocuments);
