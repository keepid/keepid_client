import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Switch, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import PrintDocument from './PrintDocument';
import ViewDocument from './ViewDocument';
import getServerURL from '../serverOverride';
import PDFType from '../static/PDFType';
import Role from '../static/Role';

interface Props {
  userRole: Role,
  username: string,
}

interface State {
  currentDocumentId: string | undefined,
  currentDocumentName: string | undefined,
  documentData: any,
}

class MyDocuments extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
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

  deleteDocument(event: any, row: any) {
    const fileId = row.id;
    fetch(`${getServerURL()}/delete-document/${fileId}`, {
      method: 'GET',
      credentials: 'include',
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
        const responseObject = responseJSON;
        const {
          documents,
        } = responseObject;
        this.setState({ documentData: documents });
      });
  }

  ButtonFormatter = (cell: any, row: any) => (
    // to get the unique id of the document, you need to set a hover state which stores the document id of the row
    // then in this function you can then get the current hover document id and do an action depending on the document id
    <div>
      <Link to="/my-documents/view">
        <button type="button" onClick={(event) => this.onViewDocument(event, row)} className="btn btn-outline-success btn-sm">
          View
        </button>
      </Link>
      {/* <Link to="/my-documents/print">
        <button type="button" className="btn btn-outline-secondary ml-2 btn-sm">
          Print
        </button>
      </Link> */}
      <button type="button" className="btn btn-outline-info ml-2 btn-sm">
        Request
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

export default MyDocuments;
