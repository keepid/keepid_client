import React, { Component, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Switch, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import DocumentViewer from './DocumentViewer';
import PrintDocument from './PrintDocument';
import ViewDocument from './ViewDocument';
import getServerURL from '../serverOverride';
import PDFType from '../static/PDFType';
import Role from '../static/Role';

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
      { showResults ? <div className="row mt-3"><DocumentViewer pdfFile={pdfFile} /></div> : null }
    </li>
  );
}

class MyDocuments extends Component<Props, State> {
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
        console.log(pdfFile);
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
            } = JSON.parse(responseJSON);
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
    const {
      alert,
    } = this.props;
    const { files } = event.target;

    this.setState({
      pdfFiles: files,
    }, () => this.handleFileDownload(rowIndex));
  }

  handleFileDownload(rowIndex: number) {
    const {
      userRole,
    } = this.props;

    const documentId = this.state.documentData[rowIndex].id;
    const documentName = this.state.documentData[rowIndex].filename;

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
        const pdfFile = new File([response], documentName, { type: 'application/pdf' });
        console.log(pdfFile);

        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch((error) => {
        alert('Error Fetching File');
      });
  }

  handleChangeFilePrint(event: any, rowIndex: number) {
    event.preventDefault();
    const {
      alert,
    } = this.props;
    const { files } = event.target;

    this.setState({
      pdfFiles: files,
    }, () => this.handleFilePrint(rowIndex));
  }

  handleFilePrint(rowIndex: number) {
    const {
      userRole,
    } = this.props;

    const documentId = this.state.documentData[rowIndex].id;
    const documentName = this.state.documentData[rowIndex].filename;

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
        const pdfFile = new File([response], documentName, { type: 'application/pdf' });
        console.log(pdfFile);
      }).catch((error) => {
        alert('Error Fetching File');
      });
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
    }, () => console.log(filename));
  }

  deleteDocument(event: any, row: any) {
    const fileId = row.id;

    fetch(`${getServerURL()}/delete-document/`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId,
        pdfType: PDFType.APPLICATION,
      }),
    }).then(() => {
      this.getDocumentData();
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
        const responseObject = JSON.parse(responseJSON);
        const {
          documents,
        } = responseObject;
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
      <button type="button" onClick={(event) => this.deleteDocument(event, row)} className="btn btn-outline-danger btn-sm ml-2">
        Delete
      </button>

    </div>
  )

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
              <h1 className="display-4">View and Print Documents</h1>
              <p className="lead pt-3">
                You can view, edit, print, and delete your documents you currently have stored on Keep.id.
              </p>
            </div>
            <div className="row justify-content-left form-group mb-5">
              <form onSubmit={this.submitForm}>
                <div className="form-row mt-3">
                  <label className="btn btn-filestack btn-widget ml-5 mr-5">
                    { pdfFiles && pdfFiles.length > 0 ? 'Choose New Files' : 'Choose Files' }
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
            <form className="form-inline my-2 my-lg-0">
              <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
              <button className="btn btn-outline-primary my-2 my-sm-0" type="submit">Search Documents</button>
            </form>
            <div className="d-flex flex-row bd-highlight mb-3 pt-5">
              <div className="w-100 pd-3">
                <BootstrapTable
                  bootstrap4
                  keyField="id"
                  data={documentData}
                  hover
                  striped
                  noDataIndication="No Documents Present"
                  columns={this.tableCols}
                  pagination={paginationFactory()}
                />
              </div>
            </div>
          </div>
        </Route>
        <Route path="/my-documents/view">
          {currentDocumentId && currentDocumentName
            ? <ViewDocument userRole={userRole} documentId={currentDocumentId} documentName={currentDocumentName} /> : <div />}
        </Route>
        <Route path="/my-documents/print">
          <PrintDocument documentId={currentDocumentId} />
        </Route>
      </Switch>
    );
  }
}

export default withAlert()(MyDocuments);
