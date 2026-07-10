import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';

import getServerURL from '../../serverOverride';
import GenericProfilePicture from '../../static/images/generalprofilepic.png';
import VisualizationSVG from '../../static/images/visualization.svg';
import Role from '../../static/Role';
import { getClientSearchCandidateQueries, matchesClientSearchQuery } from '../../utils/clientSearch';
import { canUseApplications, canUseClientNotifications, canUseCommunications } from '../../utils/featureAccess';
import { formatPhoneForDisplay } from '../../utils/phone';
import IdPickupNotificationForm from '../Notifications/IdPickupNotificationForm';

interface Props {
  username: string;
  name: string;
  organization: string;
  role: Role;
  logOut: () => void;
  alert: any;
}

interface TargetClient {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate: string;
  photo: string | null;
  profilePhoto?: {
    contentType?: string;
    byteSize?: number;
    uploadedAt?: string;
  } | null;
  assignedWorkerUsernames: string[];
  /** ISO or parseable date string from get-organization-members */
  creationDate?: string | null;
  documentCount?: number;
  applicationCount?: number;
}

type ClientSortMode = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';
type ClientViewMode = 'cards' | 'list';

function displayNameSortKey(client: TargetClient): string {
  return `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim().toLowerCase();
}

function creationTimeMs(client: TargetClient): number | null {
  const raw = client.creationDate;
  if (raw == null || raw === '') return null;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? null : t;
}

function formatBirthDateForDisplay(value: string): string {
  return value.replace(/^(\d{2})-(\d{2})-(\d{4})$/, '$1/$2/$3');
}

function hasPhoneNumberOnRecord(value?: string): boolean {
  const digits = (value || '').replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return normalized.length === 10;
}

function clientDisplayName(client: TargetClient): string {
  return `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || client.username;
}

function countLabel(count: number | undefined, singular: string, fallback: string): string {
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    return fallback;
  }

  const safeCount = count;
  return `${safeCount} ${singular}${safeCount === 1 ? '' : 's'}`;
}

function stopRowNavigation(event: React.SyntheticEvent): void {
  event.stopPropagation();
}

function sortClients(list: TargetClient[], mode: ClientSortMode): TargetClient[] {
  const next = list.slice();
  switch (mode) {
    case 'name-asc':
      next.sort((a, b) => displayNameSortKey(a).localeCompare(displayNameSortKey(b), undefined, { sensitivity: 'base' }));
      break;
    case 'name-desc':
      next.sort((a, b) => displayNameSortKey(b).localeCompare(displayNameSortKey(a), undefined, { sensitivity: 'base' }));
      break;
    case 'date-asc': {
      next.sort((a, b) => {
        const ta = creationTimeMs(a);
        const tb = creationTimeMs(b);
        const aKey = ta === null ? Number.POSITIVE_INFINITY : ta;
        const bKey = tb === null ? Number.POSITIVE_INFINITY : tb;
        return aKey - bKey;
      });
      break;
    }
    case 'date-desc': {
      next.sort((a, b) => {
        const ta = creationTimeMs(a);
        const tb = creationTimeMs(b);
        const aKey = ta === null ? Number.NEGATIVE_INFINITY : ta;
        const bKey = tb === null ? Number.NEGATIVE_INFINITY : tb;
        return bKey - aKey;
      });
      break;
    }
    default:
      break;
  }
  return next;
}

const CARD_CLIENTS_PER_PAGE = 6;
const LIST_CLIENTS_PER_PAGE = 15;

const WorkerLanding: React.FC<Props> = ({ username, name, organization, role, logOut, alert }) => {
  const history = useHistory();
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
  const [sortMode, setSortMode] = useState<ClientSortMode>('date-desc');
  const [viewMode, setViewMode] = useState<ClientViewMode>('list');
  const [isLoading, setIsLoading] = useState(true);
  const { path } = useRouteMatch();
  const canAccessApplications = canUseApplications(role, organization, username);
  const canAccessCommunications = canUseCommunications(role, organization, username);
  const canAccessNotifications = canUseClientNotifications(role, organization, username);

  const loadProfilePhoto = useCallback(async (clientsArray: TargetClient[], signal: AbortSignal) => {
    const clientsWithPhoto = clientsArray.filter((client) => client.profilePhoto != null);
    if (clientsWithPhoto.length === 0) return;

    const promises = clientsWithPhoto.map((client) => fetch(`${getServerURL()}/load-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: client.username,
      }),
    }).then((response) => response.blob()));

    try {
      const results = await Promise.all(promises);
      const photos = results.map((blob) => {
        if (blob.size > 72) {
          return (URL || window.webkitURL).createObjectURL(blob);
        }
        return null;
      });

      const photosByUsername = new Map<string, string | null>();
      clientsWithPhoto.forEach((client, i) => {
        photosByUsername.set(client.username, photos[i]);
      });
      setClients((currentClients) => currentClients.map((client) => (
        photosByUsername.has(client.username)
          ? { ...client, photo: photosByUsername.get(client.username) ?? null }
          : client
      )));
    } catch (error: any) {
      if (error.toString() !== 'AbortError: The user aborted a request.') {
        alert.show(
          `Could Not Retrieve Profile Photos. Try again or report this network failure to team keep: ${error}`,
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
        const searchQueries = getClientSearchCandidateQueries(submittedSearchName, true);
        const responses = await Promise.all(searchQueries.map(async (name) => {
          const res = await fetch(`${getServerURL()}/get-organization-members`, {
            signal,
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
              role,
              listType: 'clients',
              name,
            }),
          });
          return res.json();
        }));

        if (responses.some((responseJSON) => responseJSON.status === 'AUTH_FAILURE')) {
          alert.show('Please sign in again to continue.');
          logOut();
          return;
        }

        const peopleByUsername = new Map<string, TargetClient>();
        responses.forEach((responseJSON) => {
          if (responseJSON.status !== 'USER_NOT_FOUND' && Array.isArray(responseJSON.people)) {
            responseJSON.people.forEach((person: TargetClient) => {
              if (person.username) peopleByUsername.set(person.username, person);
            });
          }
        });

        const filteredPeople = Array.from(peopleByUsername.values())
          .map((person: TargetClient) => ({ ...person, photo: null }))
          .filter((person: TargetClient) => matchesClientSearchQuery(person, submittedSearchName));

        if (filteredPeople.length > 0) {
          setClients(filteredPeople);
          setIsLoading(false);
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
  }, [submittedSearchName, role, username, loadProfilePhoto, logOut, alert]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortMode, viewMode]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmedSearch = searchName.trim();
      setSubmittedSearchName((prev) => (prev === trimmedSearch ? prev : trimmedSearch));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchName]);

  const sortedClients = useMemo(() => sortClients(clients, sortMode), [clients, sortMode]);

  const handleClickClose = () => {
    setClientPassword('');
    setShowClientAuthModal(false);
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
          alert.show('Account not found');
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
    setSubmittedSearchName(searchName.trim());
  };

  const currentPosts = useMemo(() => {
    const clientsPerPage = viewMode === 'list' ? LIST_CLIENTS_PER_PAGE : CARD_CLIENTS_PER_PAGE;
    const indexOfLastPost = currentPage * clientsPerPage;
    const indexOfFirstPost = indexOfLastPost - clientsPerPage;
    return sortedClients.slice(indexOfFirstPost, indexOfLastPost);
  }, [sortedClients, currentPage, viewMode]);

  const clientsPerPage = viewMode === 'list' ? LIST_CLIENTS_PER_PAGE : CARD_CLIENTS_PER_PAGE;
  const lastPage = Math.max(Math.ceil(sortedClients.length / clientsPerPage), 1);

  const { pageNumbers, paginationClassName } = useMemo(() => {
    const pageNumbers: number[] = [];
    for (let i = 1; i <= lastPage; i += 1) {
      pageNumbers.push(i);
    }

    const paginationClassName = (pageNum: number): string => {
      const baseClasses = 'tw-px-3 tw-py-1 tw-border tw-border-gray-300 tw-cursor-pointer';
      const activeClasses = 'tw-bg-twprimary tw-text-white tw-border-blue-600';
      const inactiveClasses = 'tw-bg-white hover:tw-bg-gray-100';

      return `${baseClasses} ${pageNum === currentPage ? activeClasses : inactiveClasses}`;
    };

    return { pageNumbers, paginationClassName };
  }, [lastPage, currentPage]);

  const edgeButtonClassName = (disabled: boolean, side: 'left' | 'right'): string => {
    const base = `tw-px-3 tw-py-1 tw-border tw-border-gray-300 ${side === 'left' ? 'tw-rounded-l-md' : 'tw-rounded-r-md'}`;
    return disabled
      ? `${base} tw-bg-gray-100 tw-text-gray-400 tw-cursor-not-allowed`
      : `${base} tw-bg-white hover:tw-bg-gray-100 tw-cursor-pointer`;
  };

  const viewToggleClassName = (mode: ClientViewMode): string => {
    const isActive = viewMode === mode;
    const base = 'tw-inline-flex tw-h-10 tw-items-center tw-border-0 tw-px-3 tw-text-sm tw-font-semibold focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2';
    return isActive
      ? `${base} tw-bg-twprimary tw-text-white`
      : `${base} tw-bg-white tw-text-gray-700 hover:tw-bg-gray-50`;
  };

  const renderClientActionButtons = (client: TargetClient, compact = false) => {
    const clientName = clientDisplayName(client);
    const canOpenCommunications = hasPhoneNumberOnRecord(client.phone);
    const documentsLabel = compact ? countLabel(client.documentCount, 'Document', 'Documents') : 'Documents';
    const applicationsLabel = compact ? countLabel(client.applicationCount, 'Application', 'Applications') : 'Applications';
    const primaryClasses = compact
      ? 'tw-inline-flex tw-min-w-36 tw-items-center tw-justify-center tw-whitespace-nowrap tw-bg-twprimary hover:tw-bg-blue-800 tw-text-white tw-font-bold tw-py-1.5 tw-px-3 tw-rounded-md tw-text-xs tw-border-none'
      : 'tw-inline-flex tw-items-center tw-justify-center tw-bg-twprimary hover:tw-bg-blue-800 tw-text-white tw-font-bold tw-py-2 tw-px-3 tw-rounded-md tw-text-sm tw-border-none';
    const secondaryClasses = compact
      ? 'tw-inline-flex tw-min-w-36 tw-items-center tw-justify-center tw-whitespace-nowrap tw-text-twprimary hover:tw-bg-blue-50 tw-font-bold tw-py-1.5 tw-px-3 tw-text-xs tw-bg-gray-200 tw-rounded-md'
      : 'tw-inline-flex tw-items-center tw-justify-center tw-text-twprimary hover:tw-bg-blue-50 tw-font-bold tw-py-2 tw-px-3 tw-text-sm tw-bg-gray-200 tw-rounded-md';
    const disabledClasses = compact
      ? 'tw-inline-flex tw-min-w-36 tw-items-center tw-justify-center tw-whitespace-nowrap tw-text-gray-400 tw-font-bold tw-py-1.5 tw-px-3 tw-text-xs tw-bg-gray-100 tw-rounded-md tw-border-0 tw-cursor-not-allowed'
      : 'tw-inline-flex tw-items-center tw-justify-center tw-text-gray-400 tw-font-bold tw-py-2 tw-px-3 tw-text-sm tw-bg-gray-100 tw-rounded-md tw-border-0 tw-cursor-not-allowed';

    return (
      <>
        <Link
          to={{
            pathname: `/my-documents/${client.username}`,
            state: { clientName },
          }}
          className={primaryClasses}
        >
          {documentsLabel}
        </Link>
        {canAccessApplications && (
          <Link
            to={{ pathname: '/applications', state: { clientUsername: client.username, clientName } }}
            className={secondaryClasses}
          >
            {applicationsLabel}
          </Link>
        )}
        {canAccessCommunications && canOpenCommunications && (
          <Link
            to={{
              pathname: '/communications',
              search: `?client=${encodeURIComponent(client.username)}`,
              state: {
                clientUsername: client.username,
                clientName,
                clientPhone: client.phone,
              },
            }}
            className={secondaryClasses}
          >
            Communications
          </Link>
        )}
        {canAccessCommunications && !canOpenCommunications && (
          <button
            type="button"
            className={disabledClasses}
            disabled
            title="Add a phone number before opening communications"
            aria-label={`Communications unavailable for ${clientName || client.username}; no phone number on record`}
          >
            Communications
          </button>
        )}
      </>
    );
  };

  const renderClientCards = () => (
    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
      {currentPosts.map((client) => (
        <div key={client.username} className="tw-bg-white tw-shadow-[0_-3px_10px_rgba(0,0,0,0.05),0_6px_16px_rgba(0,0,0,0.10)] tw-rounded-lg tw-p-8 tw-flex tw-flex-col hover:tw-border-1 hover:tw-bg-gray-50">
          <Link
            to={`/profile/${client.username}`}
            className="tw-flex-grow tw-block tw-text-inherit hover:tw-no-underline tw-cursor-pointer"
          >
            <div className="tw-flex tw-items-center tw-mb-3">
              {client.photo ? (
                <img alt="client profile" src={client.photo} className="tw-h-14 tw-w-14 tw-rounded-full" />
              ) : (
                <img alt="a blank profile" src={GenericProfilePicture} className="tw-h-14 tw-w-14 tw-rounded-full" />
              )}
            </div>
            <div className="tw-mb-1">
              <h5 className="tw-text-xl tw-font-bold tw-text-gray-800">
                {clientDisplayName(client)}
              </h5>
            </div>
            <div className="tw-mb-1">
              <p className="tw-mb-1 tw-text-sm tw-font-medium tw-text-gray-600">
                {formatPhoneForDisplay(client.phone)}
              </p>
            </div>
            <div className="tw-mb-1">
              <p className="tw-mb-0 tw-text-sm tw-font-medium tw-text-gray-600">
                Birth Date: {formatBirthDateForDisplay(client.birthDate)}
              </p>
            </div>
          </Link>

          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-4">
            {renderClientActionButtons(client)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderClientList = () => (
    <div className="tw-overflow-x-auto tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-shadow-sm">
      <table className="tw-min-w-[760px] tw-w-full tw-divide-y tw-divide-gray-200">
        <thead className="tw-bg-gray-50">
          <tr>
            <th scope="col" className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-600">
              Client
            </th>
            <th scope="col" className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-600">
              DOB
            </th>
            <th scope="col" className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-600">
              Phone
            </th>
            <th scope="col" className="tw-px-4 tw-py-3 tw-text-right tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="tw-divide-y tw-divide-gray-100 tw-bg-white">
          {currentPosts.map((client) => (
            <tr
              key={client.username}
              className="tw-cursor-pointer hover:tw-bg-gray-50 focus:tw-bg-blue-50 focus:tw-outline-none"
              role="link"
              tabIndex={0}
              aria-label={`Open profile for ${clientDisplayName(client)}`}
              onClick={() => history.push(`/profile/${client.username}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  history.push(`/profile/${client.username}`);
                }
              }}
            >
              <td className="tw-whitespace-nowrap tw-px-4 tw-py-3 tw-text-left">
                <span className="tw-font-semibold tw-text-gray-900">
                  {clientDisplayName(client)}
                </span>
              </td>
              <td className="tw-whitespace-nowrap tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium tw-text-gray-700">
                {formatBirthDateForDisplay(client.birthDate)}
              </td>
              <td className="tw-whitespace-nowrap tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium tw-text-gray-700">
                {formatPhoneForDisplay(client.phone)}
              </td>
              <td className="tw-px-4 tw-py-3 tw-text-right">
                <div
                  className="tw-flex tw-flex-wrap tw-justify-end tw-gap-2"
                  onClick={stopRowNavigation}
                  onKeyDown={stopRowNavigation}
                >
                  {renderClientActionButtons(client, true)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderClientResults = () => {
    if (sortedClients.length === 0) {
      return (
        <div className="tw-text-center tw-py-12">
          <h3 className="tw-text-xl tw-text-gray-700">
            No Clients! Click &apos;Enroll Client&apos; to get started!
          </h3>
          <img
            className="tw-mt-8 tw-mx-auto tw-w-full tw-max-w-sm"
            src={VisualizationSVG}
            alt="Search for a client"
          />
        </div>
      );
    }

    if (viewMode === 'cards') {
      return renderClientCards();
    }

    return renderClientList();
  };

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
              <label htmlFor="authenticateForm" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Client</label>
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
      <Switch>
        <Route exact path={path}>
          <div className="tw-bg-transparent tw-pt-8 tw-pb-0">
            <div className="tw-container tw-mx-auto tw-px-4 tw-mb-4">
              <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-6">
                <h1 className="tw-text-3xl tw-font-bold tw-text-gray-800">
                  All Clients
                </h1>
                <div className="tw-flex tw-items-center tw-mt-4 sm:tw-mt-0">
                  <Link to="/enroll-client">
                    <button type="button" className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-4 tw-rounded-md hover:tw-bg-blue-700 tw-border-0">
                      Enroll Client
                    </button>
                  </Link>
                </div>
              </div>

              <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-items-stretch tw-gap-4">
                <form
                  className="tw-flex tw-w-full md:tw-w-[28rem] tw-flex-shrink-0"
                  onSubmit={handleSearchSubmit}
                >
                  <input
                    className="tw-flex-grow tw-px-4 tw-py-2.5 tw-text-base tw-border tw-border-gray-300 tw-rounded-l-md focus:tw-ring-blue-500 focus:tw-border-blue-500"
                    type="text"
                    onChange={(e) => setSearchName(e.target.value)}
                    value={searchName}
                    placeholder="Search by name, phone, email..."
                  />
                  <button type="submit" className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-4 tw-rounded-r-md hover:tw-bg-blue-700 tw-border-0">
                    Search
                  </button>
                </form>
                <div className="tw-flex tw-w-full md:tw-w-64">
                  <select
                    id="worker-client-sort"
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-bg-white"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as ClientSortMode)}
                    aria-label="Sort clients"
                  >
                    <option value="name-asc">Name (A–Z)</option>
                    <option value="name-desc">Name (Z–A)</option>
                    <option value="date-asc">Account created (oldest first)</option>
                    <option value="date-desc">Account created (newest first)</option>
                  </select>
                </div>
                <div className="tw-flex tw-w-full tw-justify-end md:tw-ml-auto md:tw-w-auto">
                  <div className="tw-inline-flex tw-overflow-hidden tw-rounded-md tw-border tw-border-gray-300 tw-bg-white" role="group" aria-label="Client result view">
                    <button
                      type="button"
                      className={viewToggleClassName('cards')}
                      onClick={() => setViewMode('cards')}
                      aria-pressed={viewMode === 'cards'}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      className={viewToggleClassName('list')}
                      onClick={() => setViewMode('list')}
                      aria-pressed={viewMode === 'list'}
                    >
                      List
                    </button>
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
                  {renderClientResults()}
                </div>
              )}
            </div>
            {showClientAuthModal && modalRender()}

            <div className="tw-container tw-mx-auto tw-px-4 tw-mt-6">
              <div className="tw-flex tw-items-center">
                {!isLoading && sortedClients.length > 0 && (
                  <>
                    <div className="tw-text-gray-600 tw-mr-4">
                      {sortedClients.length} Results
                    </div>
                    <div className="tw-flex">
                      <span
                        className={edgeButtonClassName(currentPage === 1, 'left')}
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && currentPage > 1 && setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </span>
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
                      <span
                        className={edgeButtonClassName(currentPage === lastPage, 'right')}
                        onClick={() => currentPage < lastPage && setCurrentPage(currentPage + 1)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && currentPage < lastPage && setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Route>
        <Route
          path={`${path}/notify-client/:clientUsername`}
          render={(props) => {
            if (!canAccessNotifications) {
              return <Redirect to={path} />;
            }
            const { clientUsername } = props.match.params;
            const client = clients.find((client) => client.username === clientUsername);
            const routeState = props.location.state as
              | { clientName?: string; clientPhone?: string; prefilledIdCategory?: string }
              | undefined;
            const clientFirstName = client?.firstName || '';
            const clientLastName = client?.lastName || '';
            const fullClientName = `${clientFirstName} ${clientLastName}`.trim();
            const initialClientName = fullClientName || routeState?.clientName || '';
            const initialClientPhone = client?.phone || routeState?.clientPhone || '';

            return (
              <IdPickupNotificationForm
                clientUsername={clientUsername}
                workerUsername={username}
                organizationName={organization}
                initialIdCategory={routeState?.prefilledIdCategory}
                initialClientName={initialClientName}
                initialWorkerName={name}
                initialClientPhone={initialClientPhone}
              />
            );
          }}
        />
      </Switch>
    </div>
  );
};

export default withAlert()(WorkerLanding);
