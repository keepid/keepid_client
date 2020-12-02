import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import ApplicationForm from './ApplicationForm';
import TablePageSelector from '../Base/TablePageSelector';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';

interface Props {
  username: string,
  name: string,
  organization: string,
}

interface State {
  currentApplicationId: string | undefined,
  currentApplicationFilename: string | undefined,
  documents: any[],
  currentPage: number,
  itemsPerPageSelected: any,
  numElements: number
}

const listOptions = [
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

class Applications extends Component<Props, State, {}> {
  ButtonFormatter = (cell, row, rowIndex, formatExtraData) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, rowIndex)}>View Application</button>
      </Link>
    </div>
  )

  OverflowFormatter = (cell, row, rowIndex, formatExtraData) => (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <small>{ cell }</small>
    </div>
  )

  tableCols = [{
    dataField: 'filename',
    text: 'Application Name',
    sort: true,
    formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
  }, {
    dataField: 'organizationName',
    text: 'Organization',
    sort: true,
  }, {
    dataField: 'uploadDate',
    text: 'Upload Date',
    sort: true,
  }, {
    dataField: 'uploader',
    text: 'Uploader',
    sort: true,
  }, {
    dataField: 'actions',
    text: 'Actions',
    formatter: this.ButtonFormatter,
  }];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentApplicationId: undefined,
      currentApplicationFilename: undefined,
      currentPage: 0,
      itemsPerPageSelected: listOptions[0],
      numElements: 0,
      documents: [],
    };
  }

  componentDidMount = () => {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.FORM,
        annotated: true,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          documents,
        } = responseJSON;
        const numElements = documents.length;
        if (status === 'SUCCESS') {
          const myDocuments: any[] = [];
          for (let i = 0; i < numElements; i += 1) {
            const row = documents[i];
            row.index = i;
            myDocuments.push(row);
          }
          this.setState({
            documents: myDocuments,
            numElements,
          });
        }
      });
  }

  handleChangeItemsPerPage = (itemsPerPageSelected: any) => {
    this.setState({
      currentPage: 0,
    });
  }

  handleViewDocument = (event: any, rowIndex: number) => {
    const {
      documents,
      currentPage,
      itemsPerPageSelected,
    } = this.state;

    const itemsPerPage = Number(itemsPerPageSelected.value);
    console.log(rowIndex, currentPage, itemsPerPage);
    const index = rowIndex + currentPage * itemsPerPage;
    const form = documents[index];
    const {
      id,
      filename,
    } = form;
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
      },
    );
  }

  changeCurrentPage = (newCurrentPage: number) => {
    console.log('new current page', newCurrentPage);
    this.setState({ currentPage: newCurrentPage }, this.getDocuments);
  }

  // TODO: Make this work
  getDocuments = () => {
    const {
      itemsPerPageSelected,
    } = this.state;
    const itemsPerPage = Number(itemsPerPageSelected.value);
    // fetch call here to get all the current Documents to fill
  }

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      currentPage,
      itemsPerPageSelected,
      numElements,
      documents,
    } = this.state;

    const itemsPerPage = Number(itemsPerPageSelected.value);
    const tablePageSelector = TablePageSelector({
      currentPage,
      itemsPerPage,
      numElements,
      changeCurrentPage: this.changeCurrentPage,
    });

    return (
      <Switch>
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
                  />
                </div>
              </div>
            </div>
          </div>
        </Route>
        <Route path="/applications/send">
          {currentApplicationId && currentApplicationFilename
            ? <ApplicationForm applicationFilename={currentApplicationFilename} applicationId={currentApplicationId} />
            : <div />}
        </Route>
      </Switch>
    );
  }
}

export default Applications;
