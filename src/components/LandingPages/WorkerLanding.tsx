import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import makeAnimated from 'react-select/animated';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import { LoadingButton } from '../BaseComponents/Button';
import Card from './Card';

interface Props {
  username: string;
  name: string;
  organization: string;
  role: Role;
  alert: any;
  // searchFunction: () => Promise<void>;
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
      dropdownVisible: false,
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
    // this.modalRender = this.modalRender.bind(this);
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
      },
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
        if (status !== 'USER_NOT_FOUND') {
          if (!this.state.shouldFilterByAllClients) {
            return people.filter((person: any) =>
              person.assignedWorkerUsernames.includes(this.props.username));
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
      indexOfLastPost,
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

  // render() {
  //   const { role } = this.props;
  //   const {
  //     redirectLink,
  //     clientCredentialsCorrect,
  //     clientUsername,
  //     searchName,
  //     showClients,
  //   } = this.state;

  //   const indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
  //   const indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
  //   const currentPosts = this.state.clients.slice(
  //     indexOfFirstPost,
  //     indexOfLastPost,
  //   );
  //   const lastPage = Math.ceil(
  //     this.state.clients.length / this.state.postsPerPage,
  //   );

  //   // Implement page numbers
  //   const pageNumbers: number[] = [];

  //   for (let i = 1; i <= lastPage; i += 1) {
  //     pageNumbers.push(i);
  //   }

  //   // Set current page
  //   const setPage = (pageNum) => {
  //     this.setState({ currentPage: pageNum });
  //   };

  //   const paginationClassName = (pageNum) => {
  //     if (pageNum === this.state.currentPage) {
  //       if (pageNum === 1) {
  //         return 'active-pagination-link-1';
  //       }
  //       if (pageNum === lastPage) {
  //         return 'active-pagination-link-end';
  //       }
  //       return 'active-pagination-link';
  //     }
  //     if (pageNum === 1) {
  //       return 'pagination-link-1';
  //     }
  //     if (pageNum === lastPage) {
  //       return 'pagination-link-end';
  //     }
  //     return 'pagination-link';
  //   };

  handleDropdownClick = () => {
    this.setState((prevState) => ({
      dropdownVisible: !prevState.dropdownVisible,
    }));
  };

  render() {
    return (
      <div className="tw-bg-white">
        <div className="tw-flex tw-flex-row tw-ml-24 tw-mt-8 tw-text-base">
          <div className="tw-pr-2.5">Dashboard</div>
          <div className="tw-flex tw-pr-2.5 tw-items-center tw-justify-center">
            <svg
              width="7"
              height="13"
              viewBox="0 0 7 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.942943 12.1567L6.59961 6.50007L0.942943 0.843405L-0.000390053 1.78607L4.71428 6.50007L-0.000390053 11.2141L0.942943 12.1567Z"
                fill="#212529"
              />
            </svg>
          </div>
          <div className="tw-bg-primaryLavender tw-px-2 tw-rounded-lg">
            My Clients
          </div>
        </div>
        <div className="tw-mt-10 tw-ml-36 tw-mb-10 tw-text-4xl tw-font-Raleway tw-font-semibold">
          MyClients
        </div>
        <div className="tw-flex tw-flex-wrap tw-flex-row tw-ml-28 tw-mb-10 ">
          <div className="">
            <input
              type="search"
              placeholder="Search by name, email..."
              className="tw-px-4 tw-py-2 tw-pr-20 tw-border tw-mr-2 tw-border-primaryPurple tw-rounded-lg"
              aria-label="Search"
              aria-describedby="button-search"
            />

            <button
              type="button"
              className="tw-mb-2 tw-mr-32 tw-border tw-border-primaryPurple tw-bg-primary tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-blue-500"
              id="button-search"
            >
              Search
            </button>
          </div>

          <div className="tw-h-10  tw-flex tw-mr-80 tw-flex-row tw-border tw-border-primaryPurple tw-text-primaryPurple tw-rounded-lg tw-py-2 tw-px-3">
            <button
              id="filters"
              type="button"
              className="tw-mb-2 tw-mr-2 tw-font-bold"
              aria-haspopup="true"
              onClick={() => toggleDropdown()}
            >
              Filters
            </button>
            <div id="filtersMenu" className="tw-hidden">
              hi
            </div>

            <div className="tw-flex tw-justify-center tw-items-center">
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 6L10 0H0L5 6Z"
                  fill="#445FEB"
                />
              </svg>
            </div>
          </div>
          <div className="tw-mt-2 tw-mb-2 tw-flex tw-flex-col">
            <button
              id="dropdown"
              className="tw-flex tw-semibold tw-flex-row tw-border tw-border-primaryPurple tw-text-primaryPurple tw-rounded-lg tw-py-2 tw-px-3"
              onClick={this.handleDropdownClick}
            >
              <div className="tw-w-36 tw-mr-5 tw-pr-1.5 tw-text-left tw-font-medium">
                Select an action
              </div>

              <div className="tw-flex tw-pt-1 tw-justify-center tw-items-center">
                {/* changes if dropdown clicked */}

                {this.state.dropdownVisible ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 10L8 6L4 10"
                      stroke="#445FEB"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#445FEB"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>

            <div
              className={
                this.state.dropdownVisible ? ' ' : ' tw-hidden tw-absolute'
              }
            >
              <div className="tw-mt-2 tw-py-1.5 tw-px-1.5 tw-flex tw-flex-col tw-bg-white tw-rounded-lg tw-border-2 tw-border-slate100">
                <div className="tw-pl-4 tw-pr-2 tw-py-1.5 tw-flex tw-flex-row hover:tw-bg-primaryLavender hover:tw-rounded-lg ">
                  <a href="/person-signup/client">
                    <div className="tw-ml-4 tw-mr-2 tw-flex tw-justify-center tw-items-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6668 14V12.6667C10.6668 11.9594 10.3859 11.2811 9.88578 10.781C9.38568 10.281 8.70741 10 8.00016 10H4.00016C3.29292 10 2.61464 10.281 2.11454 10.781C1.61445 11.2811 1.3335 11.9594 1.3335 12.6667V14"
                          stroke="#212529"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.00016 7.33333C7.47292 7.33333 8.66683 6.13943 8.66683 4.66667C8.66683 3.19391 7.47292 2 6.00016 2C4.5274 2 3.3335 3.19391 3.3335 4.66667C3.3335 6.13943 4.5274 7.33333 6.00016 7.33333Z"
                          stroke="#212529"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.6665 5.33325V9.33325"
                          stroke="#212529"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.6665 7.33325H10.6665"
                          stroke="#212529"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="tw-font-bold tw-font-sans tw-text-black tw-mr-1">
                      Sign up
                    </div>
                    <div className="tw-text-black">clients</div>
                  </a>
                </div>
                <div className="tw-pl-4 tw-pr-2 tw-py-1.5 tw-flex tw-flex-row hover:tw-bg-primaryLavender hover:tw-rounded-lg">
                  <div className="tw-ml-4 tw-mr-2 tw-flex tw-justify-center tw-items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3335 2.66675H2.66683C1.93045 2.66675 1.3335 3.2637 1.3335 4.00008V12.0001C1.3335 12.7365 1.93045 13.3334 2.66683 13.3334H13.3335C14.0699 13.3334 14.6668 12.7365 14.6668 12.0001V4.00008C14.6668 3.2637 14.0699 2.66675 13.3335 2.66675Z"
                        stroke="#212529"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.6668 4.66675L8.68683 8.46675C8.48101 8.5957 8.24304 8.66409 8.00016 8.66409C7.75729 8.66409 7.51932 8.5957 7.3135 8.46675L1.3335 4.66675"
                        stroke="#212529"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="tw-font-sans tw-text-slate700">
                    Invite clients
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* creating grid of cards */}
        <div className="tw-ml-20 tw-mr-20 tw-flex tw-flex-wrap tw-grid-cols-3 tw-gap-7">
          {/* gap 7.5, creating card */}

          {this.state.clients.map((client, index) => (
            <div key={index}>
              <Card client={client} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAlert()(WorkerLanding);
