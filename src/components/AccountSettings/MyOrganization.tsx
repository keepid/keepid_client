import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import Role from '../../static/Role';
import DataTable, { DataTableColumn } from '../BaseComponents/DataTable';
import RowActionMenu, { RowAction } from '../BaseComponents/RowActionMenu';
import ViewDocument from '../Documents/ViewDocument';

interface Props {
  name: string;
  organization: string;
  role: Role;
  alert: any;
}

interface OrgAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  county: string;
}

interface OrgInfo {
  name: string;
  address: OrgAddress;
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

const EMPTY_ADDRESS: OrgAddress = { line1: '', line2: '', city: '', state: '', zip: '', county: '' };

async function downloadOrgDocumentPdf(fileId: string, filename: string, alert: any) {
  try {
    const res = await fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        fileType: FileType.ORG_DOCUMENT,
      }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('json')) {
      const text = await res.text();
      let msg = text;
      try {
        const j = JSON.parse(text) as { message?: string };
        if (j.message) msg = j.message;
      } catch {
        /* keep raw */
      }
      throw new Error(msg);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert.show(`Error downloading file: ${err instanceof Error ? err.message : err}`, { type: 'error' });
  }
}

function formatAddress(a: OrgAddress): string {
  return [a.line1, a.line2, a.city, a.state, a.zip].filter(Boolean).join(', ');
}

interface OrgDocument {
  id: string;
  filename: string;
  uploadDate: string;
  uploader: string;
}

interface MailSummaryEntry {
  id: string;
  mailStatus: string;
  lobCreatedAt: number | null;
  expectedDeliveryDate: string | null;
  costCents: number;
  mailType: string;
  checkAmount: string;
  mailingAddressName: string;
  targetUsername: string;
  trackingEvents: { type: string; name: string; time: number | null; location: string }[];
}

interface MailSummaryData {
  items: MailSummaryEntry[];
  totalLetters: number;
  totalChecks: number;
  totalMailingCostCents: number;
  totalCheckAmount: string;
}

const MyOrganization: React.FC<Props> = ({ name, organization, role, alert }) => {
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({ name: '', address: { ...EMPTY_ADDRESS }, phone: '', email: '' });
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [editedOrgInfo, setEditedOrgInfo] = useState<OrgInfo>({ name: '', address: { ...EMPTY_ADDRESS }, phone: '', email: '' });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [removingUsername, setRemovingUsername] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [mailSummary, setMailSummary] = useState<MailSummaryData | null>(null);
  const [isLoadingMailSummary, setIsLoadingMailSummary] = useState(false);
  const [mailDateFrom, setMailDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [mailDateTo, setMailDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const [orgDocs, setOrgDocs] = useState<OrgDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>();
  const [currentDocumentName, setCurrentDocumentName] = useState<string | undefined>();
  const [currentUploadDate, setCurrentUploadDate] = useState<string | undefined>();
  const [currentUploader, setCurrentUploader] = useState<string | undefined>();

  const [renameTarget, setRenameTarget] = useState<OrgDocument | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteTargetDocument, setDeleteTargetDocument] = useState<OrgDocument | null>(null);

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
        const addr: OrgAddress = data.orgAddress
          ? {
            line1: data.orgAddress.line1 || '',
            line2: data.orgAddress.line2 || '',
            city: data.orgAddress.city || '',
            state: data.orgAddress.state || '',
            zip: data.orgAddress.zip || '',
            county: data.orgAddress.county || '',
          }
          : { ...EMPTY_ADDRESS };

        const info: OrgInfo = {
          name: data.name || '',
          address: addr,
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

  const fetchMailSummary = useCallback(async () => {
    setIsLoadingMailSummary(true);
    try {
      const res = await fetch(`${getServerURL()}/get-org-mail-summary`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: organization,
          fromDate: mailDateFrom,
          toDate: mailDateTo,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMailSummary(data);
      }
    } catch (error) {
      console.error('Failed to load mail summary:', error);
    } finally {
      setIsLoadingMailSummary(false);
    }
  }, [organization, mailDateFrom, mailDateTo]);

  const fetchOrgDocs = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch(`${getServerURL()}/get-files`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ fileType: 'ORG_DOCUMENT' }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' && data.documents) {
        setOrgDocs(data.documents);
      } else {
        setOrgDocs([]);
      }
    } catch (error) {
      console.error('Failed to load org docs', error);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => { fetchOrgInfo(); }, [fetchOrgInfo]);
  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);
  useEffect(() => { fetchMailSummary(); }, [fetchMailSummary]);
  useEffect(() => { fetchOrgDocs(); }, [fetchOrgDocs]);

  const handleSaveOrgInfo = async () => {
    try {
      const res = await fetch(`${getServerURL()}/update-organization-info`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: organization,
          newName: editedOrgInfo.name,
          address: editedOrgInfo.address,
          phone: editedOrgInfo.phone,
          email: editedOrgInfo.email,
        }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert.show('Organization info updated successfully.');
        setOrgInfo(editedOrgInfo);
        setIsEditingOrg(false);
      } else {
        alert.show(`Failed to update organization info: ${data.message || data.status}`, { type: 'error' });
      }
    } catch (error) {
      alert.show(`Failed to update organization info: ${error}`, { type: 'error' });
    }
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

  const updateAddress = (field: keyof OrgAddress, value: string) => {
    setEditedOrgInfo((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('fileType', 'ORG_DOCUMENT');

      const res = await fetch(`${getServerURL()}/upload-file`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text}`);
      }
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert.show('Organization document uploaded successfully.');
        fetchOrgDocs();
      } else {
        alert.show(`Failed to upload document: ${data.message || data.status}`, { type: 'error' });
      }
    } catch (error) {
      alert.show(`Failed to upload document: ${error}`, { type: 'error' });
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  };

  const closeDeleteModal = () => {
    setDeleteTargetDocument(null);
  };

  const confirmDeleteDoc = async () => {
    if (!deleteTargetDocument) return;
    try {
      const res = await fetch(`${getServerURL()}/delete-file`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ fileId: deleteTargetDocument.id, fileType: 'ORG_DOCUMENT' }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert.show('Document deleted successfully.');
        setDeleteTargetDocument(null);
        setCurrentDocumentId(undefined);
        setCurrentDocumentName(undefined);
        fetchOrgDocs();
      } else {
        alert.show(`Failed to delete document: ${data.message || data.status}`, { type: 'error' });
      }
    } catch (error) {
      alert.show(`Failed to delete document: ${error}`, { type: 'error' });
    }
  };

  const openRenameModal = (doc: OrgDocument) => {
    setRenameTarget(doc);
    setRenameValue(doc.filename.replace(/\.pdf$/i, ''));
  };

  const closeRenameModal = () => {
    if (!isRenaming) {
      setRenameTarget(null);
      setRenameValue('');
    }
  };

  const confirmRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setIsRenaming(true);
    const newFilename = renameValue.trim().endsWith('.pdf') ? renameValue.trim() : `${renameValue.trim()}.pdf`;
    try {
      const res = await fetch(`${getServerURL()}/rename-file`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: renameTarget.id, newFilename }),
      });
      const data = await res.json();
      if (data?.status === 'SUCCESS') {
        alert.show('Document renamed successfully.');
        closeRenameModal();
        fetchOrgDocs();
      } else {
        alert.show(`Failed to rename: ${data?.message || 'Unknown error'}`, { type: 'error' });
      }
    } catch (err) {
      alert.show(`Failed to rename: ${err}`, { type: 'error' });
    } finally {
      setIsRenaming(false);
    }
  };

  const getDocDisplayFileName = (filename?: string) => (filename || '').replace(/\.pdf$/i, '');

  const handleRowClick = (row: any) => {
    setCurrentDocumentId(row.id);
    setCurrentDocumentName(row.filename);
    setCurrentUploadDate(row.uploadDate);
    setCurrentUploader(row.uploader);
  };

  const getRowActions = (row: any): RowAction[] => {
    const actions: RowAction[] = [
      {
        label: 'Download',
        icon: <FileDownloadOutlinedIcon fontSize="small" />,
        onClick: () => {
          downloadOrgDocumentPdf(row.id, row.filename, alert);
        },
      },
      {
        label: 'Rename',
        icon: <DriveFileRenameOutlineIcon fontSize="small" />,
        onClick: () => openRenameModal(row),
      },
      {
        label: 'Delete',
        icon: <DeleteOutlineIcon fontSize="small" />,
        onClick: () => setDeleteTargetDocument(row),
        danger: true,
      },
    ];
    return actions;
  };

  const docColumns: DataTableColumn[] = [
    {
      field: 'filename',
      headerName: 'Name',
      renderCell: (row: any) => (
        <span
          className="tw-font-medium tw-text-gray-900 tw-block"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word' }}
        >
          {getDocDisplayFileName(row.filename)}
        </span>
      ),
    },
    {
      field: 'uploader',
      headerName: 'Uploaded By',
    },
    {
      field: 'uploadDate',
      headerName: 'Date Uploaded',
      sortable: true,
      sortType: 'date',
      renderCell: (row: any) => formatDate(row.uploadDate),
    },
    {
      field: 'actions',
      headerName: '',
      align: 'right',
      width: '48px',
      renderCell: (row: any) => <RowActionMenu actions={getRowActions(row)} />,
    },
  ];

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
            <label htmlFor="orgAddrLine1" className="col-3 card-text mt-2 text-primary-theme">Address</label>
            <div className="col-9 card-text">
              <input
                id="orgAddrLine1"
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Street address"
                value={editedOrgInfo.address.line1}
                onChange={(e) => updateAddress('line1', e.target.value)}
              />
              <input
                type="text"
                className="form-control form-purple tw-mb-1"
                placeholder="Apt, suite, etc."
                value={editedOrgInfo.address.line2}
                onChange={(e) => updateAddress('line2', e.target.value)}
              />
              <div className="tw-flex tw-gap-2">
                <input
                  type="text"
                  className="form-control form-purple"
                  placeholder="City"
                  value={editedOrgInfo.address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  style={{ maxWidth: 100 }}
                  placeholder="State"
                  value={editedOrgInfo.address.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-purple"
                  style={{ maxWidth: 120 }}
                  placeholder="Zip"
                  value={editedOrgInfo.address.zip}
                  onChange={(e) => updateAddress('zip', e.target.value)}
                />
              </div>
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
          <div className="col-9 card-text tw-pt-2">{formatAddress(orgInfo.address) || 'Not set'}</div>
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
              Click &quot;Enroll Worker&quot; to add team members.
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

  const isViewingDocument = !!(currentDocumentId && currentDocumentName);

  return (
    <div className={`tw-w-full tw-mx-auto tw-py-6 ${isViewingDocument ? '' : 'tw-max-w-5xl tw-px-4'}`}>
      <Helmet>
        <title>My Organization</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      {isViewingDocument ? (
        <ViewDocument
          userRole={role}
          documentId={currentDocumentId!}
          documentName={currentDocumentName!}
          documentDate={formatDate(currentUploadDate)}
          documentUploader={currentUploader || 'Unknown'}
          targetUser={undefined as unknown as string} // Omit targetUser to avoid backend USER_NOT_FOUND
          fileType={FileType.ORG_DOCUMENT}
          idCategory={'NONE'}
          onDownloadCurrentDocument={() => {
            downloadOrgDocumentPdf(currentDocumentId!, currentDocumentName!, alert);
          }}
          onRequestDeleteCurrentDocument={() => setDeleteTargetDocument({
            id: currentDocumentId!,
            filename: currentDocumentName!,
            uploadDate: currentUploadDate || '',
            uploader: currentUploader || '',
          })}
          resetDocumentId={() => setCurrentDocumentId(undefined)}
        />
      ) : (
        <>
          <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <div className="tw-flex tw-items-center tw-justify-between">
            <h5 className="card-title tw-mb-0">Organization Info</h5>
            <div className="tw-flex tw-gap-2">
              {!isEditingOrg && isAdmin && (
                <button type="button" className="btn btn-outline-dark" onClick={() => setIsEditingOrg(true)}>
                  Edit
                </button>
              )}
              {isEditingOrg && (
                <>
                  <button type="button" className="btn btn-outline-dark" onClick={handleCancelEditOrg}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveOrgInfo}>
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
          {renderOrgInfoContent()}
        </div>
      </div>

      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-4">
            <h5 className="card-title tw-mb-0">Workers & Admins</h5>
            {isAdmin && (
              <Link to="/enroll-worker">
                <button type="button" className="btn btn-primary tw-mt-3 sm:tw-mt-0">
                  Enroll Worker
                </button>
              </Link>
            )}
          </div>

          <form className="tw-flex tw-w-full md:tw-w-96 tw-mb-4" onSubmit={handleSearchSubmit}>
            <input
              className="form-control form-purple tw-rounded-r-none"
              type="text"
              onChange={(e) => setSearchName(e.target.value)}
              value={searchName}
              placeholder="Search by name..."
            />
            <button type="submit" className="btn btn-primary tw-rounded-l-none">
              Search
            </button>
          </form>

          {renderWorkerListContent()}
        </div>
      </div>

      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-4">
            <h5 className="card-title tw-mb-0">Mail Summary</h5>
            <div className="tw-flex tw-items-center tw-gap-2 tw-mt-3 sm:tw-mt-0">
              <input
                type="date"
                className="form-control form-purple"
                style={{ maxWidth: 160 }}
                value={mailDateFrom}
                onChange={(e) => setMailDateFrom(e.target.value)}
              />
              <span className="tw-text-gray-500">to</span>
              <input
                type="date"
                className="form-control form-purple"
                style={{ maxWidth: 160 }}
                value={mailDateTo}
                onChange={(e) => setMailDateTo(e.target.value)}
              />
            </div>
          </div>

          {isLoadingMailSummary && (
            <p className="tw-text-gray-500 tw-py-4 tw-mb-0">Loading mail summary...</p>
          )}

          {!isLoadingMailSummary && mailSummary && (
            <>
              <div className="tw-flex tw-gap-6 tw-text-sm tw-text-gray-600 tw-mb-4">
                <span><span className="tw-font-semibold tw-text-gray-900">{mailSummary.totalLetters + mailSummary.totalChecks}</span> mailed</span>
                <span><span className="tw-font-semibold tw-text-gray-900">${((mailSummary.totalMailingCostCents / 100) + parseFloat(mailSummary.totalCheckAmount || '0')).toFixed(2)}</span> total cost</span>
              </div>

              {mailSummary.items.length === 0 ? (
                <p className="tw-text-gray-500 tw-text-center tw-py-4">
                  No mailings found for this period.
                </p>
              ) : (
                <div className="tw-overflow-x-auto">
                  <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                    <thead className="tw-bg-gray-50">
                      <tr>
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Date</th>
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Destination</th>
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Mail Cost</th>
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Check Amt</th>
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                      {mailSummary.items.map((item: MailSummaryEntry) => (
                        <tr key={item.id} className="hover:tw-bg-gray-50">
                          <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-700">
                            {item.lobCreatedAt ? new Date(item.lobCreatedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-700">
                            {item.mailingAddressName || '—'}
                          </td>
                          <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-700">
                            ${(item.costCents / 100).toFixed(2)}
                          </td>
                          <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-700">
                            {item.checkAmount && item.checkAmount !== '0' ? `$${item.checkAmount}` : '—'}
                          </td>
                          <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-600">
                            {item.mailStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-4">
            <h5 className="card-title tw-mb-0">Organization Documents</h5>
            <div className="tw-mt-3 sm:tw-mt-0">
              <input
                type="file"
                accept="application/pdf"
                id="org-doc-upload"
                className="tw-hidden"
                onChange={handleUploadDoc}
                disabled={isUploadingDoc}
              />
              <label
                htmlFor="org-doc-upload"
                className={`btn btn-primary tw-m-0 ${isUploadingDoc ? 'tw-opacity-50 tw-cursor-not-allowed' : 'tw-cursor-pointer'}`}
              >
                {isUploadingDoc ? 'Uploading...' : 'Upload PDF'}
              </label>
            </div>
          </div>

          <p className="tw-text-sm tw-text-gray-500 tw-mb-4">
            These documents can be appended to application PDFs before saving. Only PDF files are supported.
          </p>

          {isLoadingDocs && (
            <p className="tw-text-gray-500 tw-py-4 tw-mb-0">Loading documents...</p>
          )}

          {!isLoadingDocs && (
            <DataTable
              columns={docColumns}
              data={orgDocs}
              keyField="id"
              emptyMessage="No organization documents uploaded yet."
              searchPlaceholder="Search documents..."
              searchFields={['filename', 'uploader', 'uploadDate']}
              pageSize={10}
              defaultSortField="uploadDate"
              defaultSortDirection="desc"
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>
      </>
      )}

      {deleteTargetDocument && (
        <div
          className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
          onClick={closeDeleteModal}
          role="presentation"
        >
          <div
            className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">
              Delete Document
            </h5>
            <p className="tw-text-gray-600 tw-mb-4">
              Are you sure you want to delete{' '}
              <span className="tw-font-semibold">
                {getDocDisplayFileName(deleteTargetDocument.filename)}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="tw-flex tw-justify-end tw-gap-3">
              <button type="button" className="btn btn-outline-dark" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDeleteDoc}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div
          className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
          onClick={() => { if (!isRenaming) closeRenameModal(); }}
          role="presentation"
        >
          <div
            className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4">
              Rename Document
            </h5>
            <input
              type="text"
              className="form-control"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && renameValue.trim()) confirmRename(); }}
              disabled={isRenaming}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <div className="tw-flex tw-justify-end tw-gap-3 tw-mt-4">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={closeRenameModal}
                disabled={isRenaming}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmRename}
                disabled={isRenaming || !renameValue.trim()}
              >
                {isRenaming ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              ({workerToRemove.email || 'no email'}) from the organization?
              This action cannot be undone.
            </p>
            <div className="tw-flex tw-justify-end tw-gap-3">
              <button type="button" className="btn btn-outline-dark" onClick={() => setRemovingUsername(null)} disabled={isRemoving}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleRemoveMember} disabled={isRemoving}>
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
