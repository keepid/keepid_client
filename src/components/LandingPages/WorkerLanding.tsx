import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { withAlert } from 'react-alert';

import Modal from 'react-bootstrap/Modal';
import Role from '../../static/Role';
import SearchSVG from '../../static/images/search.svg';
import getServerURL from '../../serverOverride';
import TablePageSelector from '../Base/TablePageSelector';

interface Props {
  username: string,
  name: string,
  organization: string,
  role: Role,
  alert: any
}

interface State {
  clients: any,
  numClients: number,
  searchName: string,
  redirectLink: string,
  clientUsername: string,
  clientPassword: string,
  itemsPerPageSelected: any,
  currentPage: number,
  clientCredentialsCorrect: boolean,
  showClientAuthModal: boolean,
}

const options = [
  { value: 'name', label: 'Name' },
  { value: 'ssn', label: 'Social Security Number' },
  { value: 'phoneNumber', label: 'Phone Number' },
];

const listOptions = [
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

const animatedComponents = makeAnimated();

class WorkerLanding extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchName: '',
      redirectLink: '',
      clientUsername: '',
      clientPassword: '',
      numClients: 0,
      clients: [{
        username: '',
        firstName: '',
        lastName: '',
      }],
      itemsPerPageSelected: listOptions[0],
      currentPage: 0,
      clientCredentialsCorrect: false,
      showClientAuthModal: false,
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
    this.changeCurrentPage = this.changeCurrentPage.bind(this);
    this.getClients = this.getClients.bind(this);
    this.handleChangeClientPassword = this.handleChangeClientPassword.bind(this);
    this.handleClickUploadDocuments = this.handleClickUploadDocuments.bind(this);
    this.handleClickViewDocuments = this.handleClickViewDocuments.bind(this);
    this.handleClickSendEmail = this.handleClickSendEmail.bind(this);
    this.handleClickSendApplication = this.handleClickSendApplication.bind(this);
    this.handleClickAuthenticateClient = this.handleClickAuthenticateClient.bind(this);
    this.handleClickClose = this.handleClickClose.bind(this);
    this.renderClients = this.renderClients.bind(this);
    this.modalRender = this.modalRender.bind(this);
  }

  componentDidMount() {
    this.getClients();
  }

  changeCurrentPage(newCurrentPage: number) {
    this.setState({ currentPage: newCurrentPage }, this.getClients);
  }

  handleChangeItemsPerPage(itemsPerPageSelected: any) {
    this.setState({
      itemsPerPageSelected,
      currentPage: 0,
    }, this.getClients);
  }

  getClients() {
    const {
      searchName,
      currentPage,
      itemsPerPageSelected,
    } = this.state;
    const itemsPerPage = Number(itemsPerPageSelected.value);
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        listType: 'clients',
        currentPage,
        itemsPerPage,
        name: searchName,
        lastName: '',
      }),
    }).then((res) => res.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const {
          people,
          numPeople,
        } = responseObject;
        if (people) {
          this.setState({
            numClients: numPeople,
            clients: people,
          });
        }
      });
  }

  handleChangeSearchName(event: any) {
    this.setState({
      searchName: event.target.value,
      currentPage: 0,
    }, this.getClients);
  }

  handleClickClose(event: any) {
    this.setState({
      clientPassword: '',
      showClientAuthModal: false,
    });
  }

  handleClickAuthenticateClient(event: any) {
    event.preventDefault();
    const {
      clientUsername,
      clientPassword,
    } = this.state;

    fetch(`${getServerURL()}/login`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: clientUsername,
        password: clientPassword,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const { loginStatus } = responseObject;
        if (loginStatus === 'AUTH_SUCCESS') {
          // Allow worker privileges
          this.setState({
            clientCredentialsCorrect: true,
          });
        } else if (loginStatus === 'AUTH_FAILURE') {
          this.props.alert.show('Incorrect Password');
        } else if (loginStatus === 'USER_NOT_FOUND') {
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

  renderClients() {
    const { showClientAuthModal } = this.state;
    const clientCards : React.ReactFragment[] = this.state.clients.map((client, i) => (
      <div key={client.username} className="card mb-3">
        <div className="card-body">
          <div className="d-flex flex-row">
            <div className="d-flex flex-column mr-4">
              <div className="p-2 ">PROFILE PICTURE HERE</div>
            </div>
            <div className="d-flex flex-lg-column mr-4">
              <h5 className="card-title mb-3 h4">
                {client.firstName}
                {' '}
                {client.lastName}
              </h5>
              <h6 className="card-subtitle mb-2 text-muted">{client.username}</h6>
              <h6 className="card-subtitle mb-2 text-muted">{client.email}</h6>
              <h6 className="card-subtitle mb-2 text-muted">
                #
                {client.phone}
              </h6>
              <h6 className="card-subtitle mb-2 text-muted">{client.address}</h6>
              <h6 className="card-subtitle mb-2 text-muted">
                {client.city}
                {', '}
                {client.state}
                {' '}
                {client.zipcode}
              </h6>
              <p className="card-text">Some information about the client here.</p>
              <a href="/" className="card-link">Client Profile</a>
            </div>
            <div className="d-flex flex-column mr-4">
              <h5 className="card-title">Recent Actions</h5>
              <h6 className="card-subtitle mb-2 text-muted">Uploaded &quot;Document 1&quot; on &quot;example date 1&quot;</h6>
              <h6 className="card-subtitle mb-2 text-muted">Uploaded &quot;Document 2&quot; on &quot;example date 2&quot;</h6>
              <h6 className="card-subtitle mb-2 text-muted">Uploaded &quot;Document 3&quot; on &quot;example date 3&quot;</h6>
            </div>
            <div className="d-flex flex-column mr-4">
              <h5 className="card-title">Client Actions</h5>
              <button
                type="button"
                className="btn btn-success mb-2 btn-sm"
                onClick={(event) => this.handleClickUploadDocuments(event, client)}
              >
                Upload Document
              </button>
              <button
                type="button"
                className="btn btn-danger mb-2 btn-sm"
                onClick={(event) => this.handleClickViewDocuments(event, client)}
              >
                View Documents
              </button>
              <button
                type="button"
                className="btn btn-info mb-2 btn-sm"
                onClick={(event) => this.handleClickSendEmail(event, client)}
              >
                Send Email
              </button>
              <button
                type="button"
                className="btn btn-dark mb-2 btn-sm"
                onClick={(event) => this.handleClickSendApplication(event, client)}
              >
                Send Application
              </button>
            </div>
          </div>
        </div>
        { showClientAuthModal ? this.modalRender() : null }
      </div>
    ));

    return clientCards;
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
            <div className="col card-text mt-2">
              Client Username
            </div>
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
            <div className="col card-text mt-2">
              Client Password
            </div>
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
          <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.handleClickClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={this.handleClickAuthenticateClient}>Submit</button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const {
      role,
    } = this.props;
    const {
      itemsPerPageSelected,
      currentPage,
      numClients,
      redirectLink,
      clientCredentialsCorrect,
      clientUsername,
    } = this.state;
    const itemsPerPage = Number(itemsPerPageSelected.value);

    if (clientCredentialsCorrect && redirectLink === '/upload-document') {
      return (
        <Redirect to={{
          pathname: '/upload-document',
          state: { clientUsername },
        }}
        />
      );
    }

    const tablePageSelector = TablePageSelector({
      currentPage,
      itemsPerPage,
      numElements: numClients,
      changeCurrentPage: this.changeCurrentPage,
    });
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
                />
                <img
                  alt="Search"
                  src={SearchSVG}
                  width="22"
                  height="22"
                  className="d-inline-block align-middle ml-1"
                />
              </form>
              <button className="btn btn-primary" type="button" data-toggle="collapse" data-target="#advancedSearch" aria-expanded="false" aria-controls="collapseExample">
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
          <div className="row ml-1 mt-2 mb-2">
            {(role === Role.Director || role === Role.Admin) ? <Link to="/person-signup/worker"><button type="button" className="btn btn-primary mr-4">Signup Worker</button></Link> : <div />}
            <Link to="/person-signup/client"><button type="button" className="btn btn-primary">Signup Client</button></Link>
          </div>
          <div className="row ml-1 mt-2 mb-2">
            {numClients === 0 ? <div /> : tablePageSelector }
            {numClients === 0 ? <div />
              : (
                <div className="w-25">
                  <div className="card card-body mt-0 mb-4 border-0 p-0">
                    <h5 className="card-text h6"># Items per page</h5>
                    <Select
                      options={listOptions}
                      autoFocus
                      closeMenuOnSelect={false}
                      onChange={this.handleChangeItemsPerPage}
                      value={itemsPerPageSelected}
                    />
                  </div>
                </div>
              )}
          </div>
          {numClients === 0 ? <h3>No Clients Found</h3> : this.renderClients()}
        </div>
      </div>
    );
  }
}

export default withAlert()(WorkerLanding);
