import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import getServerURL from '../../serverOverride';
import DocIcon from '../../static/images/doc-icon.png';
import GenericProfilePicture from '../../static/images/generalprofilepic.png';
import MenuDots from '../../static/images/menu-dots.png';
import UploadIconBlue from '../../static/images/upload-blue.png';
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
  shouldFilterByAllClients: boolean;
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
      shouldFilterByAllClients: true,
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.getClients = this.getClients.bind(this);
    this.handleChangeClientPassword =
      this.handleChangeClientPassword.bind(this);
    // this.handleClickUploadDocuments =
    // this.handleClickUploadDocuments.bind(this);
    // this.handleClickViewDocuments = this.handleClickViewDocuments.bind(this);
    // this.handleClickSendEmail = this.handleClickSendEmail.bind(this);
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

  handleChangeSearchName(event: any) {
    this.setState({
      searchName: event.target.value,
    });
    this.getClients().then(() => this.renderClients());
  }

  showClientList = () => {
    const { showClients } = this.state;
    const { currentPage } = this.state;
    this.setState({
      showClients: true,
      currentPage: 1,
    });
  };

  handleClickClose(event: any) {
    this.setState({
      clientPassword: '',
      showClientAuthModal: false,
    });
  }

  handleToggleFilteredClients = () => {
    const { shouldFilterByAllClients } = this.state;
    this.setState(
      {
        shouldFilterByAllClients: !shouldFilterByAllClients,
      },
      () => {
        // re-render the client cards
        this.getClients();
      }
    );
  };

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
      }).then((response) => response.blob());
    });

    return Promise.all(promises)
      .then((results) => {
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
            `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`
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
        if (status !== 'USER_NOT_FOUND') {
          if (!this.state.shouldFilterByAllClients) {
            return people.filter((person: any) =>
              person.assignedWorkerUsernames.includes(this.props.username)
            );
          }
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
    const currentPosts = this.state.clients.slice(
      indexOfFirstPost,
      indexOfLastPost
    );

    const pageNumbers: number[] = [];

    for (
      let i = 1;
      i <= Math.ceil(this.state.clients.length / this.state.postsPerPage);
      i += 1
    ) {
      pageNumbers.push(i);
    }

    const setPage = (pageNum) => {
      this.setState({ currentPage: pageNum });
    };
  }


    // const changeClientName = (clientFirstName, clientLastName) => `${clientFirstName}+${clientLastName}`;

    return(
        <div className="tw-h-275.25 tw-w-187.5 tw-relative tw-bg-white tw-px-0 tw-pt-0">
        //creating grid of cards
        </div>
          //<div className="tw-grid tw-grid-cols-3 tw-gap-7"> //7.5
    )
        //card
  //       <div className="">
  //       <div className=border-1 border-l-gray-300 shadow-gray-300 shadow-lg rounded-lg">
  //         //creating inner frame
  //         <div className="w-80 h-73 border-2 content-evenly justify-center items-center border-black">
  //               //profile pic 
  //     <div className="flex">
  //       <img src="/img/beams.jpg" className="rounded-full w-36 h-36 flex justify-center items-center">
  //       </img>
  //       </div>
  //       // name/caseworker name 
  //         <p className="text-center font-bold">John Appleseed</p>
  //         <p className="text-center text-gray-400">Jane Cooper</p>
        
  //       //app/doc/pf 
  //       <div className="flex h-16 gap-3 items-center px-3 py-3">
  //         <div className=" flex-auto w-27.25 border-2 rounded-lg">
  //         <div className="mx-auto">
  //           <svg className="text-center" width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M13.0003 1.66675H8.00033C7.54009 1.66675 7.16699 2.03984 7.16699 2.50008V4.16675C7.16699 4.62699 7.54009 5.00008 8.00033 5.00008H13.0003C13.4606 5.00008 13.8337 4.62699 13.8337 4.16675V2.50008C13.8337 2.03984 13.4606 1.66675 13.0003 1.66675Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //             <path d="M9.18301 10.5084C9.34552 10.3459 9.53845 10.217 9.75078 10.1291C9.96311 10.0411 10.1907 9.99585 10.4205 9.99585C10.6503 9.99585 10.8779 10.0411 11.0902 10.1291C11.3026 10.217 11.4955 10.3459 11.658 10.5084C11.8205 10.6709 11.9494 10.8639 12.0374 11.0762C12.1253 11.2885 12.1706 11.5161 12.1706 11.7459C12.1706 11.9758 12.1253 12.2033 12.0374 12.4157C11.9494 12.628 11.8205 12.8209 11.658 12.9834L7.12467 17.5001L3.83301 18.3334L4.65801 15.0418L9.18301 10.5084Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //             <path d="M13.8337 3.33325H15.5003C15.9424 3.33325 16.3663 3.50885 16.6788 3.82141C16.9914 4.13397 17.167 4.55789 17.167 4.99992V16.6666C17.167 17.1086 16.9914 17.5325 16.6788 17.8451C16.3663 18.1577 15.9424 18.3333 15.5003 18.3333H10.917" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //             <path d="M3.83301 11.2499V4.99992C3.83301 4.55789 4.0086 4.13397 4.32116 3.82141C4.63372 3.50885 5.05765 3.33325 5.49967 3.33325H7.16634" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //           </svg>
  //         </div>
  //             <p className="text-center">Applications</p>
  //               </div>
  //             <div className="flex-auto w-27.25 border-2 rounded-lg">
  //               <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M5.00033 9H10.0003M5.00033 12.3333H10.0003M11.667 16.5H3.33366C2.41318 16.5 1.66699 15.7538 1.66699 14.8333V3.16667C1.66699 2.24619 2.41318 1.5 3.33366 1.5H7.98848C8.20949 1.5 8.42146 1.5878 8.57774 1.74408L13.0896 6.25592C13.2459 6.4122 13.3337 6.62416 13.3337 6.84518V14.8333C13.3337 15.7538 12.5875 16.5 11.667 16.5Z" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //             </svg>
  //                       <p>Documents</p>
  
  //               </div>
  //               <div className="flex-auto w-18.75 border-2 rounded-lg">
  //                 <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M2.76753 13.8364C4.46056 12.8795 6.4165 12.3333 8.5 12.3333C10.5835 12.3333 12.5394 12.8795 14.2325 13.8364M11 7.33333C11 8.71405 9.88071 9.83333 8.5 9.83333C7.11929 9.83333 6 8.71405 6 7.33333C6 5.95262 7.11929 4.83333 8.5 4.83333C9.88071 4.83333 11 5.95262 11 7.33333ZM16 9C16 13.1421 12.6421 16.5 8.5 16.5C4.35786 16.5 1 13.1421 1 9C1 4.85786 4.35786 1.5 8.5 1.5C12.6421 1.5 16 4.85786 16 9Z" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //       </svg>
  
  //           <p>Profile</p>
  //               </div>
  //           </div>
  //         </div>
  
            
  //       </div>
  
  //     </div>
  
  
  
  //     <div className="border-2 border-l-gray-100 shadow-lg rounded-lg">2</div>
  //     <div className="border-2 border-l-gray-100 shadow-lg rounded-lg">3</div>
  //     <div className="border-2 border-l-gray-100 shadow-lg rounded-lg">4</div>
  //     <div className="border-2 border-l-gray-100 shadow-lg rounded-lg">5</div>
  //     <div className="border-2 border-l-gray-100 shadow-lg rounded-lg">6</div>
  
           
  //   </div>
  // </div>
  // </div>
  //   </div>
  //   </div>
  // </div>
  // </div>

    
  
  
  

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
      showClients,
    } = this.state;

    const indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
    const indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
    const currentPosts = this.state.clients.slice(
      indexOfFirstPost,
      indexOfLastPost
    );
    const lastPage = Math.ceil(
      this.state.clients.length / this.state.postsPerPage
    );

    // Implement page numbers
    const pageNumbers: number[] = [];

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
        }
        if (pageNum === lastPage) {
          return 'active-pagination-link-end';
        }
        return 'active-pagination-link';
      }
      if (pageNum === 1) {
        return 'pagination-link-1';
      }
      if (pageNum === lastPage) {
        return 'pagination-link-end';
      }
      return 'pagination-link';
    };

    return (
      <div>
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron pt-4 pb-0 jumbotron-fluid bg-transparent">
          <div className="container mb-4">
            <div className="d-flex">
              <div className="d-flex flex-column">
                <h1 className="display-5 pb-0">
                  {this.state.shouldFilterByAllClients
                    ? 'All Clients'
                    : 'My Clients'}
                </h1>
              </div>
              <div className="d-flex flex-row ml-auto">
                {role === Role.Director || role === Role.Admin ? (
                  <Link to="/person-signup/worker">
                    <button type="button" className="btn btn-primary mr-2 mb-2">
                      <div>Sign Up Worker</div>
                    </button>
                  </Link>
                ) : (
                  <div />
                )}
                <Link to="/person-signup/client">
                  <button type="button" className="btn btn-primary mb-2">
                    <div>Sign Up Client</div>
                  </button>
                </Link>
              </div>
            </div>
            <div className="d-flex">
              <form className="d-flex form-inline mr-3 justify-content-start flex-row">
                <input
                  className="form-control right-angle-right search-bar"
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
                <button
                  type="button"
                  className="btn btn-primary right-angle-left"
                  onClick={this.showClientList}
                >
                  <div style={{ fontWeight: 'bold' }}>Search</div>
                </button>
              </form>
              <div className="d-flex ml-auto flex-column font-weight-bold">
                Filters
              </div>
              <div className="d-flex ml-3 flex-column">
                <div className="form-group form-check">
                  <input
                    checked={!!this.state.shouldFilterByAllClients}
                    type="radio"
                    className="form-check-input"
                    id="showAllClients"
                    onClick={this.handleToggleFilteredClients}
                  />
                  <label className="form-check-label" htmlFor="showAllClients">
                    Show All Clients
                  </label>
                </div>
                <div className="form-group form-check">
                  <input
                    checked={!this.state.shouldFilterByAllClients}
                    type="radio"
                    className="form-check-input"
                    id="showMyAssignedClients"
                    onClick={this.handleToggleFilteredClients}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="showMyAssignedClients"
                  >
                    Show My Clients
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            {this.state.clients.length !== 0 ? (
              <div className="container px-0">
                <Row xs={1} md={3}>
                  {this.renderClients()}
                </Row>
              </div>
            ) : (
              <div>
                <h3 className="pt-4">
                  No Clients! Click &apos;Sign up Client&apos; to get started!
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
              {this.state.clients.length !== 0 ? (
                <div className="text-muted align-items-center mr-4">
                  {this.state.clients.length} Results
                </div>
              ) : null}
              {this.state.clients.length !== 0
                ? pageNumbers.map((pageNum, index) => (
                    <span
                      className={paginationClassName(pageNum)}
                      onClick={() => {
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </span>
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(WorkerLanding);
