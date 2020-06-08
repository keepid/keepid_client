import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import SendApplication from './SendApplication';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import TablePageSelector from './TablePageSelector';
import getServerURL from '../serverOverride';
import PDFType from '../static/PDFType';


interface State {
  documents: any,
}

interface Props {
  username: string,
  name: string,
  organization: string,
}

const listOptions = [
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

const exampleDocuments = [
  { applicationName: 'Application 1', category: 'Job Application' },
  { applicationName: 'Application 2', category: 'Aid Application' },
  { applicationName: 'Application 3', category: 'Job Application' },
  { applicationName: 'Application 4', category: 'SNAP Application' },
  { applicationName: 'Application 5', category: 'Other Application' },
];

class Applications extends Component<Props, State, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {
      documents: [],
    };
    this.ButtonFormatter = this.ButtonFormatter.bind(this);
    this.getApplications = this.getApplications.bind(this);
    this.handleViewDocument = this.handleViewDocument.bind(this);
  }

  handleChangeItemsPerPage(itemsPerPageSelected: any) {
    this.setState({
      itemsPerPageSelected,
      currentPage: 0,
    });
  }

  buttonFormatter(cell, row) {
    return (
      <div className="d-flex flex-column">
        <Link to="/applications/send">
          <button type="button" className="btn btn-success w-75 btn-sm p-2 m-1">Send Application</button>
        </Link>
        <Link to="/applications/send">
          <button type="button" className="btn btn-info w-75 btn-sm p-2 m-1">Check Status</button>
        </Link>
      </div>
    );
  }

  getApplications() {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.FORM,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          documents,
        } = JSON.parse(responseJSON);
        this.setState({
          documents,
        });
      });
  }

  ButtonFormatter = (cell, row, rowIndex, formatExtraData) => (
    <div>
      <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, rowIndex)}>View Application</button>
      <Link to="/applications/send">
        <button type="button" className="btn btn-success w-75 btn-sm p-2 m-1">Send Application</button>
      </Link>
      <Link to="/applications/send">
        <button type="button" className="btn btn-info w-75 btn-sm p-2 m-1">Check Status</button>
      </Link>
    </div>
  )

  handleViewDocument(event: any, rowIndex: number) {
    const {
      currentUser,
      username,
      adminName,
      organization,
    } = this.state;

    const index = rowIndex;
    const form = documents[index];
    const {
      id,
      filename,
    } = form;
    fetch(`${getServerURL()}/download/`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileID: id,
        pdfType: PDFType.FORM,
      }),
    }).then(async (response) => {
      const responseBlob : Blob = await response.blob();
      const pdfFile = new File([responseBlob], filename, { type: 'application/pdf' });

      // open pdf in new tab
      const fileURL = URL.createObjectURL(pdfFile);
      window.open(fileURL);
    }).catch((error) => {
      alert('Error Fetching File');
    });
  }

  tableCols = [{
    dataField: 'filename',
    text: 'Application Name',
    sort: true,
  }, {
    dataField: 'actions',
    text: 'Actions',
    formatter: this.ButtonFormatter,
  }];

  render() {
    const {
      documents,
    } = this.state;

    return (
      <Switch>
        <Route path="/applications/send">
          <SendApplication />
        </Route>
        <Route exact path="/applications">
          <div className="container-fluid">
            <Helmet>
              <title>Applications</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4">My Applications</h1>
                <p className="lead">See all of your applications. Check the status of each of your applications here.</p>
              </div>
            </div>
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-5">
                <div className="w-100 pd-3">
                  <BootstrapTable
                    bootstrap4
                    keyField="id"
                    data={documents}
                    hover
                    striped
                    noDataIndication="No Applications Present"
                    columns={this.tableCols}
                    pagination={paginationFactory()}
                  />
                </div>
              </div>
            </div>
          </div>
        </Route>
      </Switch>
    );
  }
}

export default Applications;
