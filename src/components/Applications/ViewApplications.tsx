/* eslint-disable no-nested-ternary */
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import ApplicationForm from './OldApplication/ApplicationForm';

interface DocumentInformation {
  uploader: string,
  organizationName: string,
  id: string,
  uploadDate: string,
  filename: string,
  formattedUploadDate?: string,
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
  searchInput: string,
  debouncedSearch: string,
  searchDebounceTimeout: number | undefined,
  currentPage: number,
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

const PAGE_SIZE = 10;

class ViewApplications extends Component<Props & RouteComponentProps, State, {}> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      currentApplicationId: undefined,
      currentApplicationFilename: undefined,
      documents: [],
      searchInput: '',
      debouncedSearch: '',
      searchDebounceTimeout: undefined,
      currentPage: 1,
      clientUsername: undefined,
      clientName: undefined,
      availableApplications: [],
    };
  }

  componentWillUnmount() {
    const { searchDebounceTimeout } = this.state;
    if (searchDebounceTimeout) {
      window.clearTimeout(searchDebounceTimeout);
    }
  }

  formatUploadDate = (rawDate: string): string => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return rawDate;
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  mapDocuments = (documents: DocumentInformation[]): DocumentInformation[] =>
    documents.map((doc) => ({
      ...doc,
      formattedUploadDate: this.formatUploadDate(doc.uploadDate || ''),
    }));

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    const { searchDebounceTimeout } = this.state;
    if (searchDebounceTimeout) {
      window.clearTimeout(searchDebounceTimeout);
    }
    const timeout = window.setTimeout(() => {
      this.setState({ debouncedSearch: nextValue.trim().toLowerCase(), currentPage: 1 });
    }, 300);
    this.setState({
      searchInput: nextValue,
      searchDebounceTimeout: timeout,
    });
  };

  handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { searchInput, searchDebounceTimeout } = this.state;
    if (searchDebounceTimeout) {
      window.clearTimeout(searchDebounceTimeout);
    }
    this.setState({
      debouncedSearch: searchInput.trim().toLowerCase(),
      searchDebounceTimeout: undefined,
      currentPage: 1,
    });
  };

  goToNextPage = (totalPages: number) => {
    this.setState((prevState) => ({
      currentPage: Math.min(prevState.currentPage + 1, totalPages),
    }));
  };

  goToPreviousPage = () => {
    this.setState((prevState) => ({
      currentPage: Math.max(prevState.currentPage - 1, 1),
    }));
  };

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
            let newDocuments: DocumentInformation[] = [];
            for (let i = 0; i < numElements; i += 1) {
              const row = documents[i];
              row.index = i;
              newDocuments.push(row);
            }
            newDocuments = this.mapDocuments(newDocuments);
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
            let newDocuments: DocumentInformation[] = [];
            for (let i = 0; i < numElements; i += 1) {
              const row = documents[i];
              row.index = i;
              newDocuments.push(row);
            }
            newDocuments = this.mapDocuments(newDocuments);
            this.setState({
              documents: newDocuments,
            });
          }
        });
    }
  }

  handleOpenApplication = (row: DocumentInformation) => {
    const {
      id,
      filename,
    } = row;
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
      },
      () => {
        this.props.history.push('/applications/send');
      },
    );
  };

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      documents,
      searchInput,
      debouncedSearch,
      currentPage,
      clientUsername,
      clientName,
      availableApplications,
    } = this.state;
    const applicationsOwner = (clientUsername === '' || clientUsername === undefined)
      ? ''
      : `${clientName || clientUsername || 'Client'}'s`;
    const filteredDocuments = debouncedSearch
      ? documents.filter((doc) => [
        doc.filename,
        doc.uploader,
        doc.organizationName,
      ].join(' ').toLowerCase().includes(debouncedSearch))
      : documents;
    const totalResults = filteredDocuments.length;
    const totalPages = Math.max(Math.ceil(totalResults / PAGE_SIZE), 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults);
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    return (
      <Switch>
        <Route exact path="/applications">
          <div className="container-fluid tw-pt-12">
            <Helmet>
              <title>Applications</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4">{applicationsOwner ? `${applicationsOwner} Applications` : 'Applications'}</h1>
              </div>
            </div>
            <div className="container">
              <div className="tw-mb-4 tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-3">
                <form onSubmit={this.handleSearchSubmit} className="tw-w-full md:tw-w-96 tw-relative">
                  <TextField
                    fullWidth
                    size="small"
                    value={searchInput}
                    onChange={this.handleSearchChange}
                    placeholder="Search by client or application name..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </form>
                <Link to={{ pathname: '/applications/createnew', state: { clientUsername: clientUsername || '', clientName: clientName || '' } }}>
                  <Button
                    className="btn btn-card"
                    style={{
                      borderRadius: 10,
                    }}
                    type="button"
                  >
                    Start a new application
                  </Button>
                </Link>
              </div>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', mb: 2 }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Application Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Upload Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {totalResults === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">No Applications Present</Typography>
                        </TableCell>
                      </TableRow>
                    ) : paginatedDocuments.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        role="button"
                        tabIndex={0}
                        onClick={() => this.handleOpenApplication(row)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            this.handleOpenApplication(row);
                          }
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontSize: '0.95rem' }}>{row.filename}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{row.uploader}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{row.formattedUploadDate || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalResults > 0 && (
                  <Box sx={{ borderTop: '1px solid #e5e7eb', py: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={this.goToPreviousPage}
                      disabled={safeCurrentPage === 1}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {`Showing ${startIndex + 1}-${endIndex} of ${totalResults}`}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => this.goToNextPage(totalPages)}
                      disabled={safeCurrentPage === totalPages}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </TableContainer>
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
                                  clientName: clientName || '',
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
