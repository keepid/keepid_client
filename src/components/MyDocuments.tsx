import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Switch, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import PrintDocument from './PrintDocument';
import ViewDocument from './ViewDocument';
import getServerURL from '../serverOverride';

interface Props {
  username: string,
}

interface State {
  currentDocumentId: string | undefined,
  documentData: any,
}

class MyDocuments extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentDocumentId: undefined,
      documentData: [],
    };
    this.getDocumentData = this.getDocumentData.bind(this);
    this.onViewDocument = this.onViewDocument.bind(this);
    this.ButtonFormatter = this.ButtonFormatter.bind(this);
  }

  componentDidMount() {
    this.getDocumentData();
  }

  onViewDocument(event: any, row: any) {
    console.log(row.id);
    let fileId = row.id.split('=')[1];
    fileId = fileId.substring(0, fileId.length - 1);
    console.log(fileId);
    this.setState({ currentDocumentId: fileId });
  }

  getDocumentData() {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => response.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        const {
          documents,
        } = responseJSON;
        console.log(responseJSON);
        this.setState({ documentData: documents });
        console.log(documents);
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
      <Link to="/my-documents/print">
        <button type="button" className="btn btn-outline-secondary ml-2 btn-sm">
          Print
        </button>
      </Link>
      <button type="button" className="btn btn-outline-info ml-2 btn-sm">
                Request
      </button>
      <button type="button" className="btn btn-outline-danger btn-sm ml-2">
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
    text: 'Actions',
    formatter: this.ButtonFormatter,
  }];

  render() {
    const {
      currentDocumentId,
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
        You can view, edit, print, and delete your documents you currently have stored on keep.id.
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
                  keyField="uploadDate"
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
          <ViewDocument documentId={currentDocumentId} />
        </Route>
        <Route path="/my-documents/print">
          <PrintDocument documentId={currentDocumentId} />
        </Route>
      </Switch>
    );
  }
}

export default MyDocuments;
