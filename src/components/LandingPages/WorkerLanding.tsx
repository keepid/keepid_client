import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';

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

interface TargetClient {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  photo: string | null;
  assignedWorkerUsernames: string[];
}

const POSTS_PER_PAGE = 6;

const WorkerLanding: React.FC<Props> = ({ username, name, organization, role, alert }) => {
  const [clients, setClients] = useState<TargetClient[]>([]);
  const [searchName, setSearchName] = useState('');
  // --- UPDATED: State for submitted search ---
  const [submittedSearchName, setSubmittedSearchName] = useState('');
  const [redirectLink, setRedirectLink] = useState('');
  const [clientUsername, setClientUsername] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientCredentialsCorrect, setClientCredentialsCorrect] = useState(false);
  const [showClientAuthModal, setShowClientAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldFilterByAllClients, setShouldFilterByAllClients] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfilePhoto = useCallback(async (clientsArray: TargetClient[], signal: AbortSignal) => {
    let photos: (string | null)[];
    let clientsWithPhotos: TargetClient[];

    const promises = clientsArray.map((client) => fetch(`${getServerURL()}/load-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: client.username,
      }),
    }).then((response) => response.blob()));

    try {
      const results = await Promise.all(promises);
      photos = results.map((blob) => {
        if (blob.size > 72) {
          return (URL || window.webkitURL).createObjectURL(blob);
        }
        return null;
      });

      clientsWithPhotos = clientsArray.slice();
      clientsArray.forEach((client, i) => {
        clientsWithPhotos[i].photo = photos[i];
      });
      setClients(clientsWithPhotos);
    } catch (error: any) {
      if (error.toString() !== 'AbortError: The user aborted a request.') {
        alert.show(
          `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`,
        );
      }
    }
  }, [alert]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchClients = async () => {
      setIsLoading(true);
      setCurrentPage(1);

      try {
        const res = await fetch(`${getServerURL()}/get-organization-members`, {
          signal,
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            role,
            listType: 'clients',
            name: submittedSearchName,
          }),
        });

        const responseJSON = await res.json();
        const { people, status } = responseJSON;

        let filteredPeople: TargetClient[] = [];
        if (status !== 'USER_NOT_FOUND' && people) {
          filteredPeople = shouldFilterByAllClients
            ? people
            : people.filter((person: TargetClient) =>
              person.assignedWorkerUsernames.includes(username));
        }

        if (filteredPeople.length > 0) {
          await loadProfilePhoto(filteredPeople, signal);
        } else {
          setClients([]);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          alert.show(`Failed to fetch clients: ${error.message}`);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      controller.abort();
    };
  }, [submittedSearchName, role, shouldFilterByAllClients, username, loadProfilePhoto, alert]);

  const handleClickClose = () => {
    setClientPassword('');
    setShowClientAuthModal(false);
  };

  const handleToggleFilteredClients = () => {
    setShouldFilterByAllClients((prev) => !prev);
  };

  const handleClickAuthenticateClient = (event: React.MouseEvent) => {
    event.preventDefault();

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
          setClientCredentialsCorrect(true);
        } else if (status === 'AUTH_FAILURE') {
          alert.show('Incorrect Password');
        } else if (status === 'USER_NOT_FOUND') {
          alert.show('Username Does Not Exist');
        } else {
          alert.show('Server Failure: Please Try Again');
        }
      });
  };

  const handleChangeClientPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientPassword(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearchName(searchName);
  };

  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * POSTS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
    return clients.slice(indexOfFirstPost, indexOfLastPost);
  }, [clients, currentPage]);

  const { pageNumbers, paginationClassName } = useMemo(() => {
    const lastPage = Math.ceil(clients.length / POSTS_PER_PAGE);
    const pageNumbers: number[] = [];
    for (let i = 1; i <= lastPage; i += 1) {
      pageNumbers.push(i);
    }

    const paginationClassName = (pageNum: number): string => {
      const baseClasses = 'tw-px-3 tw-py-1 tw-border tw-border-gray-300 tw-cursor-pointer';
      const activeClasses = 'tw-bg-twprimary tw-text-white tw-border-blue-600';
      const inactiveClasses = 'tw-bg-white hover:tw-bg-gray-100';

      let classes = `${baseClasses} ${pageNum === currentPage ? activeClasses : inactiveClasses}`;
      if (pageNum === 1) classes += ' tw-rounded-l-md';
      if (pageNum === lastPage) classes += ' tw-rounded-r-md';

      return classes;
    };

    return { pageNumbers, paginationClassName };
  }, [clients.length, currentPage]);

  const modalRender = () => {
    if (!showClientAuthModal) return null;

    return (
      <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50">
        <div className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-w-full tw-max-w-md">

          <div className="tw-border-b tw-pb-3">
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-800">Authenticate Client Account Action</h3>
          </div>

          <div className="tw-py-4">
            <div className="tw-mb-4">
              <label htmlFor="authenticateForm" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Client Username</label>
              <input
                type="text"
                id="authenticateForm"
                readOnly
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-bg-gray-100"
                value={clientUsername}
              />
            </div>
            <div>
              <label htmlFor="passwordVerification" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Client Password</label>
              <input
                type="password"
                id="passwordVerification"
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-ring-blue-500 focus:tw-border-blue-500"
                placeholder="Enter Password Here"
                onChange={handleChangeClientPassword}
                value={clientPassword}
              />
            </div>
          </div>

          <div className="tw-flex tw-justify-end tw-space-x-3 tw-border-t tw-pt-4">
            <button
              type="button"
              className="tw-py-2 tw-px-4 tw-bg-white tw-text-gray-800 tw-rounded-md hover:tw-bg-gray-300"
              onClick={handleClickClose}
            >
              Close
            </button>
            <button
              type="button"
              className="tw-py-2 tw-px-4 tw-bg-blue-600 tw-text-white tw-rounded-md hover:tw-bg-blue-700"
              onClick={handleClickAuthenticateClient}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (clientCredentialsCorrect && redirectLink) {
    return (
      <Redirect
        to={{
          pathname: redirectLink,
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
      <div className="tw-bg-transparent tw-pt-4 tw-pb-0">
        <div className="tw-container tw-mx-auto tw-px-4 tw-mb-4">
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-6">
            <h1 className="tw-text-3xl tw-font-bold tw-text-gray-800">
              {shouldFilterByAllClients ? 'All Clients' : 'My Clients'}
            </h1>
            <div className="tw-flex tw-items-center tw-mt-4 sm:tw-mt-0">
              {role === Role.Director || role === Role.Admin ? (
                <Link to="/applications" className="tw-mr-2">
                  <button type="button" className="tw-border tw-border-twprimary tw-text-twprimary hover:tw-bg-blue-50 tw-font-semibold tw-py-2 tw-px-4 tw-rounded-md tw-bg-white">
                    View Applications
                  </button>
                </Link>
              ) : null}
              {role === Role.Director || role === Role.Admin ? (
                <Link to="/person-signup/worker" className="tw-mr-2">
                  <button type="button" className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-4 tw-rounded-md hover:tw-bg-blue-700 tw-border-0">
                    Sign Up Worker
                  </button>
                </Link>
              ) : null}
              <Link to="/enroll-client">
                <button type="button" className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-4 tw-rounded-md hover:tw-bg-blue-700 tw-border-0">
                  Enroll Client
                </button>
              </Link>
            </div>
          </div>

          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start">
            <form
              className="tw-flex tw-w-full md:tw-w-auto tw-mb-4 md:tw-mb-0 md:tw-mr-4"
              onSubmit={handleSearchSubmit}
            >
              <input
                className="tw-flex-grow tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-l-md focus:tw-ring-blue-500 focus:tw-border-blue-500"
                type="text"
                onChange={(e) => setSearchName(e.target.value)}
                value={searchName}
                placeholder="Search by name, phone, email..."
              />
              <button type="submit" className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-4 tw-rounded-r-md hover:tw-bg-blue-700 tw-border-0">
                Search
              </button>
            </form>
            <div className="tw-flex tw-items-start">
              <div className="tw-font-bold tw-mr-4 tw-mt-1">Filters</div>
              <div className="tw-flex tw-flex-col">
                <div className="tw-flex tw-items-center tw-mb-2">
                  <input
                    checked={shouldFilterByAllClients}
                    type="radio"
                    id="showAllClients"
                    name="clientFilter"
                    className="tw-h-4 tw-w-4 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500"
                    onChange={handleToggleFilteredClients}
                  />
                  <label htmlFor="showAllClients" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                    Show All Clients
                  </label>
                </div>
                <div className="tw-flex tw-items-center">
                  <input
                    checked={!shouldFilterByAllClients}
                    type="radio"
                    id="showMyAssignedClients"
                    name="clientFilter"
                    className="tw-h-4 tw-w-4 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500"
                    onChange={handleToggleFilteredClients}
                  />
                  <label htmlFor="showMyAssignedClients" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                    Show My Clients
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-container tw-mx-auto tw-px-4">
          {isLoading ? (
            <div className="tw-text-center tw-py-12">
              <h3 className="tw-text-xl tw-text-gray-700">Loading Clients</h3>
              <PulseLoader color="#616161" size={6} />
            </div>
          ) : (
            <div>
              {clients.length > 0 ? (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                  {currentPosts.map((client) => (
                    <div key={client.username} className="tw-bg-white tw-shadow-lg tw-rounded-lg tw-p-8 tw-flex tw-flex-col tw-relative hover:tw-border-1 hover:tw-bg-gray-50">
                      <div className="tw-absolute tw-top-3 tw-right-3">
                        <details className="tw-relative">
                          <summary className="tw-list-none tw-cursor-pointer">
                            <img alt="menu" src={MenuDots} className="tw-h-6" />
                          </summary>
                          <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-white tw-border tw-border-gray-200 tw-rounded-md tw-shadow-xl tw-z-10">
                            <Link
                              to={`/upload-document/${client.username}`}
                              className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100"
                            >
                              <div className="tw-flex tw-items-center tw-font-semibold tw-bg-twprimary">
                                <img src={UploadIconBlue} className="tw-h-6 tw-mr-2" alt="upload icon" />
                                Upload
                              </div>
                            </Link>
                            <Link
                              to={`/my-documents/${client.username}`}
                              className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100"
                            >
                              <div className="tw-flex tw-items-center">
                                <img alt="doc icon" src={DocIcon} className="tw-h-5 tw-mx-1 tw-mr-2" />
                                View Documents
                              </div>
                            </Link>
                            <Link
                              to={{ pathname: '/applications', state: { clientUsername: client.username } }}
                              className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100"
                            >
                              <div className="tw-flex tw-items-center">
                                Fill Out Application
                              </div>
                            </Link>
                          </div>
                        </details>
                      </div>

                      <Link to={`/profile/${client.username}`} className="tw-flex-grow">
                        <div className="tw-flex tw-items-center tw-mb-3">
                          {client.photo ? (
                            <img alt="client profile" src={client.photo} className="tw-h-14 tw-w-14 tw-rounded-full" />
                          ) : (
                            <img alt="a blank profile" src={GenericProfilePicture} className="tw-h-14 tw-w-14 tw-rounded-full" />
                          )}
                        </div>
                        <div className="tw-mb-1">
                          <h5 className="tw-text-xl tw-font-bold tw-text-gray-800">
                            {client.firstName} {client.lastName}
                          </h5>
                        </div>
                        <div className="tw-mb-1">
                          <h6 className="tw-text-gray-500">{client.phone}</h6>
                        </div>
                        <div className="tw-mb-1">
                          <h6 className="tw-text-gray-500">
                            Birth Date: {client.birthDate}
                          </h6>
                        </div>
                      </Link>

                      <div className="tw-flex tw-items-center tw-mt-4">
                          <Link to={`/upload-document/${client.username}`} className="tw-mr-2">
                              <button type="button" className="tw-flex tw-items-center tw-justify-center tw-bg-twprimary hover:tw-bg-blue-800 tw-text-white tw-font-bold tw-py-2 tw-px-3 tw-rounded-md tw-text-sm tw-border-0">
                                  <img src={UploadIcon} style={{ height: 14 }} alt="upload icon" className="tw-mr-2" />
                                  Upload
                              </button>
                          </Link>
                          <Link to={`/my-documents/${client.username}`}>
                              <button type="button" className="tw-flex tw-items-center tw-justify-center tw-border tw-border-twprimary tw-text-twprimary hover:tw-bg-blue-50 tw-font-bold tw-py-2 tw-px-3 tw-rounded-md tw-text-sm tw-bg-white">
                                  View Documents
                              </button>
                          </Link>
                      </div>

                      {showClientAuthModal && modalRender()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tw-text-center tw-py-12">
                  <h3 className="tw-text-xl tw-text-gray-700">
                    No Clients! Click &apos;Sign up Client&apos; to get started!
                  </h3>
                  <img
                    className="tw-mt-8 tw-mx-auto tw-w-full tw-max-w-sm"
                    src={VisualizationSVG}
                    alt="Search for a client"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="tw-container tw-mx-auto tw-px-4 tw-mt-6">
          <div className="tw-flex tw-items-center">
            {!isLoading && clients.length > 0 && (
              <>
                <div className="tw-text-gray-600 tw-mr-4">
                  {clients.length} Results
                </div>
                <div className="tw-flex">
                  {pageNumbers.map((pageNum) => (
                    <span
                      key={pageNum}
                      className={paginationClassName(pageNum)}
                      onClick={() => setCurrentPage(pageNum)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default withAlert()(WorkerLanding);
