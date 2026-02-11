/* eslint-disable no-nested-ternary */
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Table from '../BaseComponents/Table';
import ApplicationForm from './OldApplication/ApplicationForm';

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
  documents: DocumentInformation[],
  clientUsername: string | undefined
}

interface LocationState {
  clientUsername: string
}

class ViewApplications extends Component<Props & RouteComponentProps, State, {}> {
  ButtonFormatter = (cell, row) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}>View Application</button>
      </Link>
    </div>
  );

  OverflowFormatter = (cell) => (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <small>{ cell }</small>
    </div>
  );

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

  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      currentApplicationId: undefined,
      currentApplicationFilename: undefined,
      documents: [],
      clientUsername: undefined,
    };
  }

  componentDidMount() {
    const { location } = this.props;
    // Client view, uncertain if location.state is undefined by default
    if (location.state === undefined) {
      fetch(`${getServerURL()}/get-files`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          fileType: FileType.APPLICATION_PDF,
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
    } else { // Case worker view
      // clientName will be passed in via Link state in WorkerLanding page
      const { clientUsername } = location.state as LocationState;
      this.setState({ clientUsername });
      fetch(`${getServerURL()}/get-files`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          fileType: FileType.APPLICATION_PDF,
          targetUser: clientUsername,
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
  };

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      documents,
      clientUsername,
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
                <h1 className="display-4">{(clientUsername === '' || clientUsername === undefined) ? 'My' : `${clientUsername}'s`} Applications</h1>
                <Link to={{ pathname: '/applications/createnew', state: { clientUsername: clientUsername || '' } }}>
                  <Button
                    className="btn btn-card mt-3 tw-mb-6"
                    style={{
                      borderRadius: 10,
                    }}
                    type="button"
                  >
                    Start a new application
                  </Button>
                </Link>
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
            ? (clientUsername
              // Case worker view
              ? <ApplicationForm applicationFilename={currentApplicationFilename} applicationId={currentApplicationId} clientUsername={clientUsername} />
              // Client view, clientUsername will default to empty string which is not a valid username
              : <ApplicationForm applicationFilename={currentApplicationFilename} applicationId={currentApplicationId} clientUsername="" />)
            : <div />}
        </Route>
      </Switch>
    );
  }
}

// withRouter needed to access location in props
export default withRouter(ViewApplications);
