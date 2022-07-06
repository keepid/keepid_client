import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import DocIcon from '../../static/images/doc-icon.png';
import GenericProfilePicture from '../../static/images/generalprofilepic.png';
import MenuDots from '../../static/images/menu-dots.png';
import SearchSVG from '../../static/images/search.svg';
import UploadIcon from '../../static/images/upload-icon.png';
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
  showClients: boolean;
  currentPage: number;
  postsPerPage: number;
  clientCards: any;
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
      showClients: false,
      currentPage: 1,
      postsPerPage: 6,
      clientCards: [],
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.getClients = this.getClients.bind(this);
    this.handleChangeClientPassword =
        this.handleChangeClientPassword.bind(this);
    this.handleClickUploadDocuments =
        this.handleClickUploadDocuments.bind(this);
    this.handleClickViewDocuments = this.handleClickViewDocuments.bind(this);
    // this.handleClickSendEmail = this.handleClickSendEmail.bind(this);
    this.handleClickSendApplication =
      this.handleClickSendApplication.bind(this);
    // this.handleClickAuthenticateClient =
    // this.handleClickAuthenticateClient.bind(this);
    // this.handleClickClose = this.handleClickClose.bind(this);
    this.renderClients = this.renderClients.bind(this);
    // this.modalRender = this.modalRender.bind(this);
  }

  componentDidMount() {
    this.getClients();
  }

  handleChangeSearchName(event: any) {
    this.setState(
      {
        searchName: event.target.value,
      },
    );
    this.getClients()
      .then(() => this.renderClients());
  }

  showClientList = () => {
    const { showClients } = this.state;
    const { currentPage } = this.state;
    this.setState(
      {
        showClients: true,
        currentPage: 1,
      },
    );
  }

  /* handleClickClose(event: any) {
    this.setState({
      clientPassword: '',
      showClientAuthModal: false,
    });
  } */

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
        // console.log(responseJSON);
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
      clientCredentialsCorrect: true,
    });
  }

  handleClickViewDocuments(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/my-documents',
      clientCredentialsCorrect: true,
    });
  }

  /* handleClickSendEmail(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/email',
      showClientAuthModal: true,
    });
  } */

  handleClickSendApplication(event: any, client: any) {
    this.setState({
      clientUsername: client.username,
      redirectLink: '/applications',
      clientCredentialsCorrect: true,
    });
  }

  handleChangeClientPassword(event: any) {
    this.setState({
      clientPassword: event.target.value,
    });
  }

  loadProfilePhoto(clientsArray: any) {
    const signal = this.controllerRef.current?.signal;
    let url: any;
    let photos;
    let clients;

    const promises = clientsArray.map((client) => {
      const { username } = client;
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
        this.setState({ clients });
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
        // console.log(responseJSON);
        if (status !== 'USER_NOT_FOUND') {
          return people;
        }
        return [];
      })
      .then((result) => this.loadProfilePhoto(result));
  }

  renderClients() {
    const { showClientAuthModal } = this.state;

    const indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
    const indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
    const currentPosts = this.state.clients.slice(indexOfFirstPost, indexOfLastPost);

    const pageNumbers : number[] = [];

    for (let i = 1; i <= Math.ceil(this.state.clients.length / this.state.postsPerPage); i += 1) {
      pageNumbers.push(i);
    }

    const setPage = (pageNum) => {
      this.setState({ currentPage: pageNum });
    };

    const clientCards: React.ReactFragment[] = currentPosts.map(
      (client, i) => (
        <div key={client.username} className="card client-card mb-4 mr-4 flex-column">
          <div className="dropdown lock-top-right">
            <a href="#" id="imageDropdown" data-toggle="dropdown">
              <img alt="menu" src={MenuDots} className="menu-height" />
            </a>
            <div className="dropdown-menu">
              <button
                type="button"
                className="dropdown-item"
                onClick={(event) =>
                  this.handleClickSendApplication(event, client)
                }
              >
                <div className="view-docs-btn-text">
                  <img alt="doc icon" src={DocIcon} className="icon-height mr-1" />
                  {' Complete Application'}
                </div>
              </button>
            </div>
          </div>
          <Link to={`/profile/${client.username}`}>
          <div className="card-body px-0 py-0 card-body-positioning">
            <div className="d-flex flex-row mb-3">
              <img
                alt="a blank profile"
                src={GenericProfilePicture}
                className="profile-pic-size"
              />
            </div>
            <div className="d-flex flex-row mb-2">
              <h5 className="card-title h4">
                {client.firstName}
                {' '}
                {client.lastName}
              </h5>
            </div>
            <div className="d-flex flex-row mb-2">
              <h6 className="card-subtitle text-muted">
                {client.phone}
              </h6>
            </div>
            <div className="d-flex flex-row mb-3">
              <h6 className="card-subtitle text-muted">
                {'Birth Date: '}
                {client.birthDate}
              </h6>
            </div>
          </div>
          </Link>
          <div className="row lock-bottom-left">
            <button
              type="button"
              className="btn btn-primary mr-2 btn-sm button-height"
              onClick={(event) =>
                this.handleClickUploadDocuments(event, client)
              }
            >
              <div className="upload-text-style">
                <img alt="upload icon" src={UploadIcon} className="upload-icon-height" />
                {' Upload'}
              </div>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm primary-color-border button-height"
              onClick={(event) =>
                this.handleClickViewDocuments(event, client)
              }
            >
              <div className="view-docs-btn-text">View Documents</div>
            </button>
            {/* <Link to={`/profile/${client.username}`}>
              <button
                type="button"
                className="btn btn-secondary btn-sm button-height"
              >
                View Profile
              </button>
            </Link> */}
          </div>
          {/* showClientAuthModal ? this.modalRender() : null */}
        </div>
      ),
    );

    this.setState({ clientCards });
  }

  /* modalRender() {
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
  } */

  render() {
    const { role } = this.props;
    const {
      redirectLink,
      clientCredentialsCorrect,
      clientUsername,
      searchName,
      showClients,
    } = this.state;

    const indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
    const indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
    const currentPosts = this.state.clients.slice(indexOfFirstPost, indexOfLastPost);
    const lastPage = Math.ceil(this.state.clients.length / this.state.postsPerPage);

    // Implement page numbers
    const pageNumbers : number[] = [];

    for (let i = 1; i <= lastPage; i += 1) {
      pageNumbers.push(i);
    }

    // Set current page
    const setPage = (pageNum) => {
      this.setState({ currentPage: pageNum });
    };

    const paginationClassName = (pageNum) => {
      if (pageNum === this.state.currentPage) {
        if (pageNum === 1) {
          return 'active-pagination-link-1';
        } if (pageNum === lastPage) {
          return 'active-pagination-link-end';
        }
        return 'active-pagination-link';
      }
      if (pageNum === 1) {
        return 'pagination-link-1';
      } if (pageNum === lastPage) {
        return 'pagination-link-end';
      }
      return 'pagination-link';
    };

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
            <div className="container mb-4">
              <h1 className="display-5 pb-0">My Clients</h1>
              <div className="d-flex flex-row justify-content-between">
                <form className="form-inline mr-3">
                  <input
                    className="form-control right-angle-right"
                    style={{ width: 500 }}
                    type="text"
                    onChange={this.handleChangeSearchName}
                    value={this.state.searchName}
                    placeholder="Search by name, phone number, email..."
                    aria-label="Search"
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        this.showClientList();
                        event.preventDefault();
                      }
                    }}
                  />
                  <button type="button" className="btn btn-primary right-angle-left" onClick={this.showClientList}>
                    <div style={{ fontWeight: 'bold' }}>Search</div>
                  </button>
                </form>
                {/* <button
=======
      <div>
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron pt-4 pb-0 jumbotron-fluid bg-transparent">
          <div className="container mb-4">
            <h1 className="display-5 pb-0">My Clients</h1>
            <div className="d-flex flex-row justify-content-between">
              <form className="form-inline mr-3">
                <input
                  className="right-angle-right form-control"
                  type="text"
                  onChange={this.handleChangeSearchName}
                  value={this.state.searchName}
                  placeholder="Search by name, email..."
                  aria-label="Search"
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      this.showClientList();
                      event.preventDefault();
                    }
                  }}
                />
                <button type="button" className="btn btn-primary right-angle-left" onClick={this.showClientList}>
                  <div>Search</div>
                </button>
              </form>
              {/* <button
                className="btn btn-secondary"
                type="button"
                data-toggle="collapse"
                data-target="#advancedSearch"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Advanced Search
                </button> */}
              <div>
                {role === Role.Director || role === Role.Admin ? (
                <Link to="/person-signup/worker">
                  <button type="button" className="btn btn-primary mr-2">
                    <div>Sign Up Worker</div>
                  </button>
                </Link>
                ) : (
                  <div />
                )}
                <Link to="/person-signup/client">
                  <button type="button" className="btn btn-primary mr-4">
                    <div>Sign Up Client</div>
                  </button>
                </Link>
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
            {(searchName.length !== 0 || showClients) ? (
                <div className="container px-0">
                  <Row xs={1} md={3}>
                    {this.state.clientCards}
                  </Row>
                </div>
            ) : (
                <div>
                  <h3 className="pt-4">
                    Search a client&apos;s name to get started
                  </h3>
                  <img
                    className="pt-4 visualization-svg"
                    src={VisualizationSVG}
                    alt="Search a client"
                  />
                </div>

            )}
          </div>
        </div>
        <div className="container">
          {(this.state.clients.length !== 0) ? (
            <div className="container px-0">
              <Row xs={1} md={3}>
                {this.renderClients()}
              </Row>
            </div>
          ) : (
            <div>
              <h3 className="pt-4">
                No Clients! Add a client with &apos;Sign up Client&apos;
              </h3>
              <img
                className="pt-4 visualization-svg"
                src={VisualizationSVG}
                alt="Search a client"
              />
            </div>
          )}
        </div>
        <div className="container">
          <div className="flex row justify-content-left align-items-center mt-2">
            {(searchName.length !== 0 || showClients) ? (
              <div className="text-muted align-items-center mr-4">
                {this.state.clients.length} Results
              </div>
            ) : (null)
            }
            {(this.state.clients.length !== 0) ? (
              pageNumbers.map((pageNum, index) => (
                <span
                  className={paginationClassName(pageNum)}
                  onClick={() => { setPage(pageNum); }}
                >
                  {pageNum}
                    </span>
                ))) : (null)
               }
            </div>
          </div>
          </div>
        </div>
    );
  }
}

export default withAlert()(WorkerLanding);
