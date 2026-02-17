import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';

interface Props {
  name: string;
  organization: string;
  role: Role;
  alert: any;
}

interface OrgInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface Worker {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  creationDate: string;
  privilegeLevel: string;
}

const MyOrganization: React.FC<Props> = ({ name, organization, role, alert }) => {
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({ name: '', address: '', phone: '', email: '' });
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [editedOrgInfo, setEditedOrgInfo] = useState<OrgInfo>({ name: '', address: '', phone: '', email: '' });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [removingUsername, setRemovingUsername] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const isAdmin = role === Role.Director || role === Role.Admin;

  const workerToRemove = useMemo(
    () => workers.find((w) => w.username === removingUsername) ?? null,
    [workers, removingUsername],
  );

  const fetchOrgInfo = useCallback(async () => {
    setIsLoadingOrg(true);
    try {
      const res = await fetch(`${getServerURL()}/get-organization-info`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ orgName: organization }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        const info: OrgInfo = {
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
        };
        setOrgInfo(info);
        setEditedOrgInfo(info);
      }
    } catch (error) {
      alert.show(`Failed to load organization info: ${error}`);
    } finally {
      setIsLoadingOrg(false);
    }
  }, [organization, alert]);

  const fetchWorkers = useCallback(async () => {
    setIsLoadingWorkers(true);
    try {
      const res = await fetch(`${getServerURL()}/get-organization-members`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          role,
          listType: 'members',
          name: searchName,
        }),
      });
      const data = await res.json();
      if (data.people) {
        setWorkers(data.people);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      alert.show(`Failed to load workers: ${error}`);
    } finally {
      setIsLoadingWorkers(false);
    }
  }, [role, searchName, alert]);

  useEffect(() => {
    fetchOrgInfo();
  }, [fetchOrgInfo]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSaveOrgInfo = async () => {
    alert.show('Organization info saved (display only - server update endpoint not yet connected).');
    setOrgInfo(editedOrgInfo);
    setIsEditingOrg(false);
  };

  const handleCancelEditOrg = () => {
    setEditedOrgInfo(orgInfo);
    setIsEditingOrg(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleRemoveMember = async () => {
    if (!removingUsername) return;
    setIsRemoving(true);
    try {
      const res = await fetch(`${getServerURL()}/remove-organization-member`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: removingUsername }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert.show('Member removed successfully.');
        setRemovingUsername(null);
        fetchWorkers();
      } else {
        alert.show(`Failed to remove member: ${data.message || data.status}`, { type: 'error' });
      }
    } catch (error) {
      alert.show(`Failed to remove member: ${error}`, { type: 'error' });
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const renderOrgInfoContent = () => {
    if (isLoadingOrg) {
      return <p className="tw-mb-0 tw-text-gray-500 tw-mt-2">Loading...</p>;
    }

    if (isEditingOrg) {
      return (
        <>
          <hr />
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="orgName" className="col-3 card-text mt-2 text-primary-theme">Name</label>
            <div className="col-9 card-text">
              <input
                id="orgName"
                type="text"
                className="form-control form-purple"
                value={editedOrgInfo.name}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, name: e.target.value })}
              />
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="orgAddress" className="col-3 card-text mt-2 text-primary-theme">Address</label>
            <div className="col-9 card-text">
              <input
                id="orgAddress"
                type="text"
                className="form-control form-purple"
                value={editedOrgInfo.address}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, address: e.target.value })}
              />
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="orgPhone" className="col-3 card-text mt-2 text-primary-theme">Phone</label>
            <div className="col-9 card-text">
              <input
                id="orgPhone"
                type="text"
                className="form-control form-purple"
                value={editedOrgInfo.phone}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="orgEmail" className="col-3 card-text mt-2 text-primary-theme">Email</label>
            <div className="col-9 card-text">
              <input
                id="orgEmail"
                type="email"
                className="form-control form-purple"
                value={editedOrgInfo.email}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, email: e.target.value })}
              />
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <hr />
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Name</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.name || 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Address</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.address || 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Phone</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.phone || 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Email</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.email || 'Not set'}</div>
        </div>
      </>
    );
  };

  const renderWorkerListContent = () => {
    if (isLoadingWorkers) {
      return <p className="tw-text-gray-500 tw-py-4 tw-mb-0">Loading workers...</p>;
    }

    if (workers.length === 0) {
      return (
        <div className="tw-text-center tw-py-8">
          <p className="tw-text-gray-500">No workers found in your organization.</p>
          {isAdmin && (
            <p className="tw-text-sm tw-text-gray-400 tw-mt-1">
              Click &quot;Sign Up Worker&quot; to add team members.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="tw-overflow-x-auto">
        <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
          <thead className="tw-bg-gray-50">
            <tr>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Name
              </th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Email
              </th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Role
              </th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Onboard Date
              </th>
              {isAdmin && (
                <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {workers.map((worker) => (
              <tr key={worker.username} className="hover:tw-bg-gray-50">
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900">
                  {worker.firstName} {worker.lastName}
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  {worker.email || 'N/A'}
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800">
                    {worker.privilegeLevel}
                  </span>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  {formatDate(worker.creationDate)}
                </td>
                {isAdmin && (
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm">
                    {worker.privilegeLevel !== 'Admin' && worker.privilegeLevel !== 'Director' && (
                      <button
                        type="button"
                        className="tw-text-red-600 hover:tw-text-red-800 tw-font-medium tw-bg-transparent tw-border-0 tw-cursor-pointer"
                        onClick={() => setRemovingUsername(worker.username)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
      <Helmet>
        <title>My Organization</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      {/* Organization Info Section */}
      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <div className="tw-flex tw-items-center tw-justify-between">
            <h5 className="card-title tw-mb-0">Organization Info</h5>
            <div className="tw-flex tw-gap-2">
              {!isEditingOrg && isAdmin && (
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => setIsEditingOrg(true)}
                >
                  Edit
                </button>
              )}
              {isEditingOrg && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={handleCancelEditOrg}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveOrgInfo}
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
          {renderOrgInfoContent()}
        </div>
      </div>

      {/* Worker List Section */}
      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-4">
            <h5 className="card-title tw-mb-0">Workers & Admins</h5>
            {isAdmin && (
              <Link to="/person-signup/worker">
                <button
                  type="button"
                  className="btn btn-primary tw-mt-3 sm:tw-mt-0"
                >
                  Sign Up Worker
                </button>
              </Link>
            )}
          </div>

          <form
            className="tw-flex tw-w-full md:tw-w-96 tw-mb-4"
            onSubmit={handleSearchSubmit}
          >
            <input
              className="form-control form-purple tw-rounded-r-none"
              type="text"
              onChange={(e) => setSearchName(e.target.value)}
              value={searchName}
              placeholder="Search by name..."
            />
            <button
              type="submit"
              className="btn btn-primary tw-rounded-l-none"
            >
              Search
            </button>
          </form>

          {renderWorkerListContent()}
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      {removingUsername && workerToRemove && (
        <div
          className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
          onClick={() => { if (!isRemoving) setRemovingUsername(null); }}
          role="presentation"
        >
          <div
            className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">
              Remove Member
            </h5>
            <p className="tw-text-gray-600 tw-mb-4">
              Are you sure you want to remove{' '}
              <span className="tw-font-semibold">
                {workerToRemove.firstName} {workerToRemove.lastName}
              </span>{' '}
              ({workerToRemove.email || workerToRemove.username}) from the organization?
              This action cannot be undone.
            </p>
            <div className="tw-flex tw-justify-end tw-gap-3">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setRemovingUsername(null)}
                disabled={isRemoving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRemoveMember}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAlert()(MyOrganization);
