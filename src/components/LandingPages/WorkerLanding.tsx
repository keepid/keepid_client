import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import getServerURL from '../../serverOverride';
import GenericProfilePicture from '../../static/images/blank-profile-picture.png';
import SearchSVG from '../../static/images/search.svg';
import DefaultProfilePhoto from '../../static/images/Solid_grey.svg';
import VisualizationSVG from '../../static/images/visualization.svg';
import Role from '../../static/Role';

interface Props {
  username: string;
  name: string;
  organization: string;
  role: Role;
  alert: any;
}

interface State {
  clients: any;
  searchName: string;
  redirectLink: string;
  clientUsername: string;
  clientPassword: string;
  clientCredentialsCorrect: boolean;
  showClientAuthModal: boolean;
  clientCards: any;
  search: boolean;
  loading: boolean;
}

const options = [
  { value: 'name', label: 'Name' },
  { value: 'ssn', label: 'Social Security Number' },
  { value: 'phoneNumber', label: 'Phone Number' },
];

const animatedComponents = makeAnimated();

class WorkerLanding extends Component<Props, State> {
  private controllerRef: React.MutableRefObject<AbortController | null>;

  constructor(props: Props) {
    super(props);
    this.controllerRef = React.createRef();
    this.state = {
      searchName: '',
      redirectLink: '',
      clientUsername: '',
      clientPassword: '',
      clients: [],
      clientCredentialsCorrect: false,
      showClientAuthModal: false,
      clientCards: null,
      search: false,
      loading: false,
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.getClients = this.getClients.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.handleChangeClientPassword =
      this.handleChangeClientPassword.bind(this);
    this.handleClickUploadDocuments =
      this.handleClickUploadDocuments.bind(this);
    this.handleClickViewDocuments = this.handleClickViewDocuments.bind(this);
    this.handleClickSendEmail = this.handleClickSendEmail.bind(this);
    this.handleClickSendApplication =
      this.handleClickSendApplication.bind(this);
    this.handleClickAuthenticateClient =
      this.handleClickAuthenticateClient.bind(this);
    this.handleClickClose = this.handleClickClose.bind(this);
    this.renderClients = this.renderClients.bind(this);
    this.modalRender = this.modalRender.bind(this);
  }

  componentDidMount() {
    this.getClients();
  }

  loadProfilePhoto(clientsArray: any) {
    const signal = this.controllerRef.current?.signal;
    let url: any;
    let photos;
    let clients;

    const promises = clientsArray.map((client) => {
      const { username } = client;
      this.setState({ loading: true });
      return fetch(`${getServerURL()}/load-pfp`, {
        signal,
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          username,
        }),
      })
        .then((response) => response.blob());
    });

    return Promise.all(promises).then((results) => {
      photos = results.map((blob) => {
        const { size } = blob;
        if (size > 72) {
          url = (URL || window.webkitURL).createObjectURL(blob);
          return url;
        }
        return null;
      });
    })
      .catch((error) => {
        if (error.toString() !== 'AbortError: The user aborted a request.') {
          const { alert } = this.props;
          alert.show(
            `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`,
          );
        }
      })
      .then(() => {
        clients = clientsArray.slice();
        clientsArray.forEach((client, i) => {
          clients[i].photo = photos[i];
        });
        this.setState({
          clients,
          loading: false,
        });
      });
  }

  handleChangeSearchName(event: any) {
    this.setState(
      {
        searchName: event.target.value,
      },
    );
  }

  handleClickClose(event: any) {
    this.setState({
      clientPassword: '',
      showClientAuthModal: false,
    });
  }

  handleClickAuthenticateClient(event: any) {
    event.preventDefault();
    const { clientUsername, clientPassword } = this.state;

    fetch(`${getServerURL()}/login`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: clientUsername,
        password: clientPassword,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        const { status } = responseJSON;
        if (status === 'AUTH_SUCCESS') {
          // Allow worker privileges
          this.setState({
            clientCredentialsCorrect: true,
          });
        } else if (status === 'AUTH_FAILURE') {
          this.props.alert.show('Incorrect Password');
        } else if (status === 'USER_NOT_FOUND') {
          this.props.alert.show('Username Does Not Exist');
        } else {
          this.props.alert.show('Server Failure: Please Try Again');
        }
      });
  }

  handleClickUploadDocuments(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/upload-document',
      showClientAuthModal: true,
    });
  }

  handleClickViewDocuments(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/my-documents',
      showClientAuthModal: true,
    });
  }

  handleClickSendEmail(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/email',
      showClientAuthModal: true,
    });
  }

  handleClickSendApplication(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/applications',
      showClientAuthModal: true,
    });
  }

  handleChangeClientPassword(event: any) {
    this.setState({
      clientPassword: event.target.value,
    });
  }

  handleSearch() {
    this.getClients()
      .then(() => this.renderClients())
      .then(() => {
        this.setState({ search: true });
      });
  }

  clearSearch() {
    this.setState({
      search: false,
      searchName: '',
    });
  }

  getClients() {
    const { searchName } = this.state;
    const { role } = this.props;
    return fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        role,
        listType: 'clients',
        name: searchName,
      }),
    })
      .then((res) => res.json())
      .then((responseJSON) => {
        const { people, status } = responseJSON;
        if (status !== 'USER_NOT_FOUND') {
          return people;
        }
        return [];
      })
      .then((result) => this.loadProfilePhoto(result));
  }

  renderClients() {
    const { showClientAuthModal } = this.state;
    const clientCards: React.ReactFragment[] = this.state.clients.map(
      (client, i) => (
        <div key={client.username} className="card mb-3">
          <div className="card-body">
            <div className="d-flex flex-row">
              <div className="d-flex flex-column mr-4">
                {client.photo === null ? (
                    <img
                      alt="a blank profile"
                      className="profile-picture"
                      src={GenericProfilePicture}
                    />
                ) : (
                    <div id="profilePhoto">
                      <img
                        alt="a blank profile"
                        className="profile-picture"
                        src={client.photo}
                      />
                    </div>
                )}
              </div>
              <div className="d-flex flex-lg-column mr-4">
                <h5 className="card-title mb-3 h4">
                  {client.firstName}

                  {client.lastName}
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  {client.username}
                </h6>
                <h6 className="card-subtitle mb-2 text-muted">
                  {client.email}
                </h6>
                <h6 className="card-subtitle mb-2 text-muted">
                  #
{client.phone}
                </h6>
                <h6 className="card-subtitle mb-2 text-muted">
                  {client.address}
                </h6>
                <h6 className="card-subtitle mb-2 text-muted">
                  {client.city}
                  {', '}
                  {client.state}

                  {client.zipcode}
                </h6>
                <p className="card-text">
                  Some information about the client here.
                </p>
                <Link to={`/profile/${client.username}`}>
                  <button type="button" className="btn btn-primary">
                    Client Profile
                  </button>
                </Link>
              </div>
              <div className="d-flex flex-column mr-4">
                <h5 className="card-title">Client Actions</h5>
                <button
                  type="button"
                  className="btn btn-success mb-2 btn-sm"
                  onClick={(event) =>
                    this.handleClickUploadDocuments(event, client)
                  }
                >
                  Upload Document
                </button>
                <button
                  type="button"
                  className="btn btn-danger mb-2 btn-sm"
                  onClick={(event) =>
                    this.handleClickViewDocuments(event, client)
                  }
                >
                  View Documents
                </button>
                <button
                  type="button"
                  className="btn btn-dark mb-2 btn-sm"
                  onClick={(event) =>
                    this.handleClickSendApplication(event, client)
                  }
                >
                  Send Application
                </button>
              </div>
            </div>
          </div>
          {showClientAuthModal ? this.modalRender() : null}
        </div>
      ),
    );

    this.setState({ clientCards });
  }

  modalRender() {
    const { showClientAuthModal } = this.state;
    return (
      <Modal key="authenticateAction" show={showClientAuthModal}>
        <Modal.Header>
          <Modal.Title>Authenticate Client Account Action</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row mb-3 mt-3">
            <div className="col card-text mt-2">Client Username</div>
            <div className="col-6 card-text">
              <input
                type="text"
                className="form-control form-purple"
                id="authenticateForm"
                readOnly
                placeholder="Enter Username Here"
                value={this.state.clientUsername}
              />
            </div>
          </div>
          <div className="row mb-3 mt-3">
            <div className="col card-text mt-2">Client Password</div>
            <div className="col-6 card-text">
              <input
                type="password"
                className="form-control form-purple"
                id="passwordVerification"
                placeholder="Enter Password Here"
                onChange={this.handleChangeClientPassword}
                value={this.state.clientPassword}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            data-dismiss="modal"
            onClick={this.handleClickClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleClickAuthenticateClient}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const { role } = this.props;
    const {
      redirectLink,
      clientCredentialsCorrect,
      clientUsername,
      searchName,
    } = this.state;
    if (clientCredentialsCorrect && redirectLink === '/upload-document') {
      return (
        <Redirect
          to={{
            pathname: '/upload-document',
            state: { clientUsername },
          }}
        />
      );
    }

    return (
      <div>
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron pt-4 pb-0 jumbotron-fluid bg-transparent">
          <div className="container">
            <h1 className="display-5 pb-0">My Clients</h1>
            <p className="lead">Use the search bar to help look up clients.</p>
            <div className="d-flex flex-row">
              <form className="form-inline mr-3 w-50">
                <input
                  className="form-control mr-2 w-75"
                  type="text"
                  onChange={this.handleChangeSearchName}
                  value={this.state.searchName}
                  placeholder="Search Name"
                  aria-label="Search"
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      this.handleSearch();
                    }
                  }}
                />
                <button type="button" className="btn btn-primary mr-4" onClick={this.handleSearch}>
                <img
                  alt="Search"
                  src={SearchSVG}
                  width="22"
                  height="22"
                  className="d-inline-block align-middle ml-1"
                />
                </button>
              </form>
              {this.state.search && (
                  <button type="button" className="btn btn-primary mr-4" onClick={this.clearSearch}>
                    Clear Search
                  </button>
              )}
              <button
                className="btn btn-primary"
                type="button"
                data-toggle="collapse"
                data-target="#advancedSearch"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Toggle Advanced Search
              </button>
            </div>
            <div className="collapse" id="advancedSearch">
              <div className="card card-body mt-3 mb-2 ml-0 pl-0 w-50 border-0">
                <h5 className="card-title">Search on multiple fields</h5>
                <Select
                  options={options}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti
                />
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row mt-2 mb-2">
            {role === Role.Director || role === Role.Admin ? (
              <Link to="/person-signup/worker">
                <button type="button" className="btn btn-primary mr-4">
                  Signup Worker
                </button>
              </Link>
            ) : (
              <div />
            )}
            <Link to="/person-signup/client">
              <button type="button" className="btn btn-primary">
                Signup Client
              </button>
            </Link>
          </div>
          {this.state.loading && (
          <div className="spinner-border" role="status">
            <span className="visually-hidden"></span>
          </div>
          )}
          {this.state.search && !this.state.loading ? (
            this.state.clientCards
          ) : (
              <div>
                <h3 className="pt-4">
                  Search a Client&apos;s name to get Started
                </h3>
                <img
                  className="pt-4 visualization-svg"
                  src={VisualizationSVG}
                  alt="Search a client"
                />
              </div>
          ) }
        </div>
      </div>
    );
  }
}

export default withAlert()(WorkerLanding);
