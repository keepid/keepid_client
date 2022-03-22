import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import View from '../../static/images/view-icon.png';
import PDFType from '../../static/PDFType';
import SearchBar from '../BaseComponents/SearchBar';
import Table from '../BaseComponents/Table';
import Logo from '../static/images/logo.svg';
import ApplicationForm from './ApplicationForm';

interface DocumentInformation {

  uploader: string,
  organizationName: string,
  id: string,
  uploadDate: string,
  filename: string,
  view: string,
  checkbox: boolean,
  actions: string
}

interface Props {
  username: string,
  name: string,
  organization: string,
}

interface State {
  currentApplicationId: string | undefined,
  currentApplicationFilename: string | undefined,
  documents: DocumentInformation[]
}

class Applications extends Component<Props, State, {}> {
  ButtonFormatter = (cell, row) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}> <b>Apply Now</b></button>
      </Link>
    </div>
  )

  DoubleButtonFormatter = (cell, row) => (
    <div className="double-button-jawn">
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-110 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}> <b>Download</b></button>
      </Link>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary-sixers w-110 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}> <b>Delete File</b></button>
      </Link>
    </div>
  )

  PreviewFormatter = (cell, row) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn preview-button w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}><img src={View} alt="description of image" /> <strong>Click to Preview the PDF</strong></button>
      </Link>
    </div>
  )

  ViewFormatter = (cell, row) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn preview-button w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}><img src={View} alt="description of image" /> <strong>Click to View</strong></button>
      </Link>
    </div>
  )

  OverflowFormatter = (cell) => (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <small>{ cell }</small>
    </div>
  )

  availableTableCols = [
    {
      dataField: 'filename',
      text: 'Application Name',
      sort: true,
      formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
    },
    // {
    //   dataField: 'uploadDate',
    //   text: 'Date Uploaded',
    //   sort: true,
    // }, {
    //   dataField: 'uploader',
    //   text: 'Uploaded By',
    //   sort: true,
    // },
    {
      dataField: 'apply',
      text: '',
      formatter: this.ButtonFormatter,
    }, {
      dataField: 'preview the form',
      text: 'Preview the Form',
      formatter: this.PreviewFormatter,
    }];

    completedTableCols = [
      {
        dataField: 'filename',
        text: 'Application Name',
        sort: true,
        formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
      }, {
        dataField: 'uploadDate',
        text: 'Date Uploaded',
        sort: true,
      },
      // {
      //   dataField: 'uploader',
      //   text: 'Uploaded By',
      //   sort: true,
      // },
      {
        dataField: 'view',
        text: 'View Application',
        formatter: this.ViewFormatter,
      }, {
        dataField: 'actions',
        text: 'Actions',
        formatter: this.DoubleButtonFormatter,
      }];

    constructor(props: Props) {
      super(props);
      this.state = {
        currentApplicationId: undefined,
        currentApplicationFilename: undefined,
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
        console.log(responseJSON);
        const {
          status,
          documents,
        } = responseJSON;
        const numElements = documents.length;
        if (status === 'SUCCESS') {
          const newDocuments: DocumentInformation[] = [];
          for (let i = 0; i < numElements; i += 1) {
            const row = documents[i];
            row.index = i;
            newDocuments.push(row);
          }
          this.setState({
            documents: newDocuments,
          });
        }
      });
  }

  handleViewDocument = (event: any, row: any) => {
    const {
      id,
      filename,
    } = row;
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
      },
    );
  }

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      documents,
    } = this.state;

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
                <h1 className="display-4" style={{ fontWeight: 'bold' }}>My Available Applications</h1>
                <p className="lead">Here are all the applications that are available to you. <br />Please click the “Apply Now” button to start applying.</p>
              </div>
            </div>
            <div className="search-pad">
              <SearchBar
                searchOnClick={() => { }}
                searchLoading
              />
            </div>
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-1">
                <div className="w-100 pd-3">
                  <Table
                    columns={this.availableTableCols}
                    data={documents}
                    emptyInfo={{ description: 'No Applications Present' }}
                  />
                </div>
              </div>
            </div>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4" style={{ fontWeight: 'bold' }}>My Completed Applications</h1>
                <p className="lead">Here are all your available applications. <br />Check or manage your applications here.</p>
              </div>
            </div>
            <div className="search-pad">
              <SearchBar
                searchOnClick={() => { }}
                searchLoading
              />
            </div>
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-1">
                <div className="w-100 pd-3">
                  <Table
                    columns={this.completedTableCols}
                    data={documents}
                    emptyInfo={{ description: 'No Applications Present' }}
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
