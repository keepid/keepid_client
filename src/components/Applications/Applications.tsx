import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Table from '../BaseComponents/Table';
import ApplicationForm from './ApplicationForm';

interface DocumentInformation {
  uploader: string,
  organizationName: string,
  id: string,
  uploadDate: string,
  filename: string,
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
        <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}>View Application</button>
      </Link>
    </div>
  )

  OverflowFormatter = (cell) => (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <small>{ cell }</small>
    </div>
  )

  tableCols = [{
    dataField: 'filename',
    text: 'Application Name',
    sort: true,
    // formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
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
      documents: [],
    };
  }

  componentDidMount() {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.BLANK_FORM,
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
                <h1 className="display-4">My Applications</h1>
                <p className="lead">See all of your applications. Check the status of each of your applications here.</p>
              </div>
            </div>
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-5">
                <div className="w-100 pd-3">
                  <Table
                    columns={this.tableCols}
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
