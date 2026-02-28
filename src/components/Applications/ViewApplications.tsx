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
  clientUsername: string | undefined,
  clientName: string | undefined,
  availableApplications: {
    lookupKey: string;
    type: string;
    state: string;
    situation: string;
    canStart: boolean;
  }[],
}

interface LocationState {
  clientUsername: string;
  clientName?: string;
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
      clientName: undefined,
      availableApplications: [],
    };
  }

  parseLookupKey = (lookupKey: string): { type: string; state: string; situation: string } | null => {
    const parseWithDelimiter = (delimiter: string) => {
      const first = lookupKey.indexOf(delimiter);
      const second = lookupKey.indexOf(delimiter, first + 1);
      if (first < 0 || second < 0) return null;
      return {
        type: lookupKey.substring(0, first),
        state: lookupKey.substring(first + 1, second),
        situation: lookupKey.substring(second + 1),
      };
    };

    return parseWithDelimiter('$') || parseWithDelimiter('#');
  };

  loadAvailableApplications = () => {
    fetch(`${getServerURL()}/get-available-application-options`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((items) => {
        if (!Array.isArray(items)) {
          this.setState({ availableApplications: [] });
          return;
        }
        const parsed = items
          .filter((x) => x && x.lookupKey)
          .map((x) => {
            const lookupKey = String(x.lookupKey);
            const split = this.parseLookupKey(lookupKey);
            return {
              lookupKey,
              type: split?.type || String(x.type || ''),
              state: split?.state || String(x.state || ''),
              situation: split?.situation || String(x.situation || ''),
              canStart: Boolean(split?.type && split?.state && split?.situation),
            };
          });
        this.setState({ availableApplications: parsed });
      })
      .catch(() => {
        this.setState({ availableApplications: [] });
      });
  };

  componentDidMount() {
    this.loadAvailableApplications();
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
      const { clientUsername, clientName } = location.state as LocationState;
      this.setState({ clientUsername, clientName });
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
      clientName,
      availableApplications,
    } = this.state;

    return (
      <Switch>
        <Route exact path="/applications">
          <div className="container-fluid tw-pt-8">
            <Helmet>
              <title>Applications</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4">{(clientUsername === '' || clientUsername === undefined) ? 'My' : `${clientName || 'Client'}'s`} Applications</h1>
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
              <div className="pt-4">
                <h4>Available Applications</h4>
                <p className="text-muted mb-2">
                  Click an entry to start directly at Review with this lookup key.
                </p>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered bg-white">
                    <thead>
                      <tr>
                        <th>Lookup Key</th>
                        <th>Type</th>
                        <th>State</th>
                        <th>Situation</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableApplications.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-muted">No applications available.</td>
                        </tr>
                      )}
                      {availableApplications.map((app) => (
                        <tr key={app.lookupKey}>
                          <td>{app.lookupKey}</td>
                          <td>{app.type || '-'}</td>
                          <td>{app.state || '-'}</td>
                          <td>{app.situation || '-'}</td>
                          <td>
                            <Link
                              to={{
                                pathname: '/applications/createnew',
                                state: {
                                  clientUsername: clientUsername || '',
                                  startAtReview: true,
                                  presetApplication: {
                                    lookupKey: app.lookupKey,
                                    type: app.type,
                                    state: app.state,
                                    situation: app.situation,
                                  },
                                },
                              }}
                            >
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={!app.canStart}
                                title={app.canStart ? 'Start' : 'Lookup key not parseable'}
                              >
                                Start
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
