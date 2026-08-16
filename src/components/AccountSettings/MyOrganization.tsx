import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import { formatAddress as formatPostalAddress } from '../../utils/address';
import { formatPhoneForDisplay } from '../../utils/phone';

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
  ein: string;
  designatedDirectorUsername: string;
  directorTitle: string;
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

function formatAddress(a: OrgAddress): string {
  return formatPostalAddress(a);
}

// Format a Date as YYYY-MM-DD using local calendar fields. Avoids the UTC skew
// of toISOString(), which can roll the date back a day for users west of UTC.
function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface OrganizationDocumentAsset {
  roleKey: string;
  displayName: string;
  description: string;
  acceptedMimeTypes: string[];
  maxBytes: number;
  asset?: {
    documentId: string;
    filename: string;
    mimeType: string;
    byteSize: number;
    uploadedAt: string;
  } | null;
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
  // Per the 2026-05-13 product feedback, the mail summary table now
  // shows the application's title and the client's name instead of the
  // mailing-address name. Backend ships these alongside the existing
  // fields (see MailSendService.projectMailWithContext).
  applicationType: string;
  clientFirstName: string;
  clientLastName: string;
  clientFullName: string;
}

interface MailSummaryData {
  items: MailSummaryEntry[];
  totalLetters: number;
  totalChecks: number;
  totalMailingCostCents: number;
  totalCheckAmount: string;
}

interface OrganizationReportResponse {
  status: string;
  message?: string;
  reportText?: string;
}

const MyOrganization: React.FC<Props> = ({ name, organization, role, alert }) => {
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({
    name: '',
    address: { ...EMPTY_ADDRESS },
    phone: '',
    email: '',
    ein: '',
    designatedDirectorUsername: '',
    directorTitle: '',
  });
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [editedOrgInfo, setEditedOrgInfo] = useState<OrgInfo>({
    name: '',
    address: { ...EMPTY_ADDRESS },
    phone: '',
    email: '',
    ein: '',
    designatedDirectorUsername: '',
    directorTitle: '',
  });
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
    d.setDate(1);
    return toLocalISODate(d);
  });
  const [mailDateTo, setMailDateTo] = useState(() => toLocalISODate(new Date()));
  const [reportDateFrom, setReportDateFrom] = useState(() => toLocalISODate(new Date()));
  const [reportDateTo, setReportDateTo] = useState(() => toLocalISODate(new Date()));
  const [reportShowClientNames, setReportShowClientNames] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [documentAssets, setDocumentAssets] = useState<OrganizationDocumentAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [savingAssetRole, setSavingAssetRole] = useState<string | null>(null);

  const canManageMembers = role === Role.Director || role === Role.Admin;
  const canEditOrganization = role === Role.Admin;
  const canManageDocumentAssets = role === Role.Director || role === Role.Admin;

  const directorCandidates = useMemo(
    () => workers.filter(
      (worker) => worker.privilegeLevel === 'Admin' || worker.privilegeLevel === 'Director',
    ),
    [workers],
  );

  const designatedDirectorDisplayName = useMemo(() => {
    if (!orgInfo.designatedDirectorUsername) return '';
    const selected = workers.find((worker) => worker.username === orgInfo.designatedDirectorUsername);
    if (!selected) return orgInfo.designatedDirectorUsername;
    return `${selected.firstName} ${selected.lastName}`.trim() || selected.username;
  }, [orgInfo.designatedDirectorUsername, workers]);

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
          ein: data.ein || '',
          designatedDirectorUsername: data.designatedDirectorUsername || '',
          directorTitle: data.directorTitle || '',
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

  const fetchDocumentAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    try {
      const res = await fetch(`${getServerURL()}/api/organization/document-assets`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setDocumentAssets(await res.json());
    } catch (error) {
      console.error('Failed to load organization document assets', error);
      setDocumentAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  useEffect(() => { fetchOrgInfo(); }, [fetchOrgInfo]);
  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);
  useEffect(() => { fetchMailSummary(); }, [fetchMailSummary]);
  useEffect(() => { fetchDocumentAssets(); }, [fetchDocumentAssets]);

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
          ein: editedOrgInfo.ein,
          designatedDirectorUsername: editedOrgInfo.designatedDirectorUsername || null,
          directorTitle: editedOrgInfo.directorTitle,
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
      const res = await fetch(`${getServerURL()}/remove-user`, {
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

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch(`${getServerURL()}/get-organization-report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: reportDateFrom,
          toDate: reportDateTo,
          showClientNames: reportShowClientNames,
        }),
      });
      const data = await res.json() as OrganizationReportResponse;
      if (data.status === 'SUCCESS') {
        setReportText(data.reportText || '');
      } else {
        alert.show(`Failed to generate report: ${data.message || data.status}`, { type: 'error' });
      }
    } catch (error) {
      alert.show(`Failed to generate report: ${error}`, { type: 'error' });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyReport = async () => {
    if (!reportText.trim()) return;
    try {
      await navigator.clipboard.writeText(reportText);
      alert.show('Report copied.');
    } catch {
      alert.show('Unable to copy report automatically. Select the text and copy it manually.', { type: 'error' });
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

  const handleUploadAsset = async (
    roleKey: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavingAssetRole(roleKey);
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch(`${getServerURL()}/api/organization/document-assets/${encodeURIComponent(roleKey)}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      alert.show('Organization document asset saved.');
      await fetchDocumentAssets();
    } catch (error) {
      alert.show(`Failed to upload asset: ${error instanceof Error ? error.message : error}`, { type: 'error' });
    } finally {
      setSavingAssetRole(null);
      e.target.value = '';
    }
  };

  const removeDocumentAsset = async (role: OrganizationDocumentAsset) => {
    if (!window.confirm(`Remove ${role.displayName}? New generated documents will require it to be uploaded again.`)) return;
    setSavingAssetRole(role.roleKey);
    try {
      const res = await fetch(`${getServerURL()}/api/organization/document-assets/${encodeURIComponent(role.roleKey)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      alert.show(`${role.displayName} removed.`);
      await fetchDocumentAssets();
    } catch (error) {
      alert.show(`Failed to remove asset: ${error instanceof Error ? error.message : error}`, { type: 'error' });
    } finally {
      setSavingAssetRole(null);
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
                className="form-control form-purple tw-py-2"
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
                className="form-control form-purple tw-mb-1 tw-py-2"
                placeholder="Street address"
                value={editedOrgInfo.address.line1}
                onChange={(e) => updateAddress('line1', e.target.value)}
              />
              <input
                type="text"
                className="form-control form-purple tw-mb-1 tw-py-2"
                placeholder="Apt, suite, etc."
                value={editedOrgInfo.address.line2}
                onChange={(e) => updateAddress('line2', e.target.value)}
              />
              <div className="tw-flex tw-gap-2">
                <input
                  type="text"
                  className="form-control form-purple tw-py-2"
                  placeholder="City"
                  value={editedOrgInfo.address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-purple tw-py-2"
                  style={{ maxWidth: 100 }}
                  placeholder="State"
                  value={editedOrgInfo.address.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-purple tw-py-2"
                  style={{ maxWidth: 120 }}
                  placeholder="Zip"
                  value={editedOrgInfo.address.zip}
                  onChange={(e) => updateAddress('zip', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="orgEin" className="col-3 card-text mt-2 text-primary-theme">EIN</label>
            <div className="col-9 card-text">
              <input
                id="orgEin"
                type="text"
                className="form-control form-purple tw-py-2"
                value={editedOrgInfo.ein}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, ein: e.target.value })}
                placeholder="12-3456789"
              />
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="orgPhone" className="col-3 card-text mt-2 text-primary-theme">Phone</label>
            <div className="col-9 card-text">
              <input
                id="orgPhone"
                type="text"
                className="form-control form-purple tw-py-2"
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
                className="form-control form-purple tw-py-2"
                value={editedOrgInfo.email}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, email: e.target.value })}
              />
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="designatedDirectorUsername" className="col-3 card-text mt-2 text-primary-theme">Director</label>
            <div className="col-9 card-text">
              <select
                id="designatedDirectorUsername"
                className="form-control form-purple tw-py-2"
                value={editedOrgInfo.designatedDirectorUsername}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, designatedDirectorUsername: e.target.value })}
              >
                <option value="">No designated director</option>
                {directorCandidates.map((member) => (
                  <option key={member.username} value={member.username}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row tw-mb-2 tw-mt-1">
            <label htmlFor="directorTitle" className="col-3 card-text mt-2 text-primary-theme">Director title</label>
            <div className="col-9 card-text">
              <input
                id="directorTitle"
                type="text"
                className="form-control form-purple tw-py-2"
                value={editedOrgInfo.directorTitle}
                onChange={(e) => setEditedOrgInfo({ ...editedOrgInfo, directorTitle: e.target.value })}
                placeholder="Director of Services"
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
          <div className="col-3 card-text mt-2 text-primary-theme">EIN</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.ein || 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Phone</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.phone ? formatPhoneForDisplay(orgInfo.phone) : 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Email</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.email || 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Director</div>
          <div className="col-9 card-text tw-pt-2">{designatedDirectorDisplayName || 'Not set'}</div>
        </div>
        <div className="row tw-mb-2 tw-mt-1">
          <div className="col-3 card-text mt-2 text-primary-theme">Director title</div>
          <div className="col-9 card-text tw-pt-2">{orgInfo.directorTitle || 'Not set'}</div>
        </div>
      </>
    );
  };

  const renderReportContent = () => (
    <div className="tw-space-y-4">
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-[1fr_auto_1fr] tw-gap-3 md:tw-items-end">
        <div>
          <label htmlFor="reportDateFrom" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
            Start date
          </label>
          <input
            id="reportDateFrom"
            type="date"
            className="form-control form-purple"
            value={reportDateFrom}
            onChange={(e) => setReportDateFrom(e.target.value)}
          />
        </div>
        <span className="tw-hidden md:tw-block tw-text-gray-500 tw-pb-2">to</span>
        <div>
          <label htmlFor="reportDateTo" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
            End date
          </label>
          <input
            id="reportDateTo"
            type="date"
            className="form-control form-purple"
            value={reportDateTo}
            onChange={(e) => setReportDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-3">
        <label htmlFor="reportShowClientNames" className="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-700 tw-mb-0">
          <input
            id="reportShowClientNames"
            type="checkbox"
            className="tw-h-4 tw-w-4"
            checked={reportShowClientNames}
            onChange={(e) => setReportShowClientNames(e.target.checked)}
          />
          Show client names and detail
        </label>
        <div className="tw-flex tw-gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </button>
          <button
            type="button"
            className="btn btn-outline-dark tw-inline-flex tw-items-center tw-gap-2"
            onClick={handleCopyReport}
            disabled={!reportText.trim()}
          >
            <ContentCopyOutlinedIcon fontSize="small" />
            Copy
          </button>
        </div>
      </div>

      <textarea
        className="form-control form-purple tw-font-mono tw-text-sm tw-leading-6"
        rows={reportText ? 14 : 7}
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
        placeholder="Generate a report to preview copy-ready text here."
      />
    </div>
  );

  const renderWorkerListContent = () => {
    if (isLoadingWorkers) {
      return <p className="tw-text-gray-500 tw-py-4 tw-mb-0">Loading workers...</p>;
    }

    if (workers.length === 0) {
      return (
        <div className="tw-text-center tw-py-8">
          <p className="tw-text-gray-500">No workers found in your organization.</p>
          {canManageMembers && (
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
              {canManageMembers && (
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
                {canManageMembers && (
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

          <div className="card mt-3 mb-3 pl-5 pr-5">
            <div className="card-body">
              <div className="tw-flex tw-items-center tw-justify-between">
                <h5 className="card-title tw-mb-0">Organization Info</h5>
                <div className="tw-flex tw-gap-2">
                  {!isEditingOrg && canEditOrganization && (
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

          {canEditOrganization && (
            <div className="card mt-3 mb-3 pl-5 pr-5">
              <div className="card-body">
                <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-start sm:tw-justify-between tw-gap-2 tw-mb-4">
                  <div>
                    <h5 className="card-title tw-mb-1">Generate Report</h5>
                    <p className="tw-text-sm tw-text-gray-500 tw-mb-0">
                      Create a copy-ready activity summary for a date or date range.
                    </p>
                  </div>
                </div>
                {renderReportContent()}
              </div>
            </div>
          )}

          <div className="card mt-3 mb-3 pl-5 pr-5">
            <div className="card-body">
              <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-4">
                <h5 className="card-title tw-mb-0">Workers & Admins</h5>
                {canManageMembers && (
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
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Application Type</th>
                        <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">Client Name</th>
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
                            {item.applicationType || '—'}
                          </td>
                          <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-700">
                            {item.clientFullName || '—'}
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
              <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-start sm:tw-justify-between tw-gap-3 tw-mb-5">
                <div>
                  <h5 className="card-title tw-mb-1">Document Automation Setup</h5>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-0">
                    Keep.id inserts these organization assets into published document templates when a service record is created.
                  </p>
                </div>
                {!isLoadingAssets && documentAssets.length > 0 && (
                  <span className="tw-shrink-0 tw-rounded-full tw-bg-gray-100 tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-text-gray-700">
                    {documentAssets.filter((item) => item.asset).length} of {documentAssets.length} ready
                  </span>
                )}
              </div>

              {isLoadingAssets && (
                <p className="tw-text-gray-500 tw-py-4 tw-mb-0">Loading setup...</p>
              )}

              {!isLoadingAssets && (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  {documentAssets.map((assetRole) => {
                    const inputId = `org-asset-${assetRole.roleKey}`;
                    const saving = savingAssetRole === assetRole.roleKey;
                    const accept = assetRole.acceptedMimeTypes.join(',');
                    let uploadLabel = assetRole.asset ? 'Replace' : 'Upload';
                    if (saving) uploadLabel = 'Saving...';
                    return (
                      <section
                        key={assetRole.roleKey}
                        className={`tw-rounded-xl tw-border tw-p-4 ${assetRole.asset ? 'tw-border-emerald-200 tw-bg-emerald-50/40' : 'tw-border-gray-200 tw-bg-white'}`}
                      >
                        <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                          <div>
                            <h6 className="tw-mb-1 tw-font-semibold tw-text-gray-900">{assetRole.displayName}</h6>
                            <p className="tw-mb-0 tw-text-xs tw-leading-5 tw-text-gray-500">{assetRole.description}</p>
                          </div>
                          <span className={`tw-shrink-0 tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold ${assetRole.asset ? 'tw-bg-emerald-100 tw-text-emerald-700' : 'tw-bg-amber-100 tw-text-amber-700'}`}>
                            {assetRole.asset ? 'Ready' : 'Needed'}
                          </span>
                        </div>

                        {assetRole.asset && (
                          <div className="tw-mt-3 tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-px-3 tw-py-2">
                            <div className="tw-truncate tw-text-sm tw-font-medium tw-text-gray-800">{assetRole.asset.filename}</div>
                            <div className="tw-mt-1 tw-text-xs tw-text-gray-500">
                              {(assetRole.asset.byteSize / 1024).toFixed(0)} KB · Uploaded {formatDate(assetRole.asset.uploadedAt)}
                            </div>
                          </div>
                        )}

                        <div className="tw-mt-4 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                          {canManageDocumentAssets && (
                            <>
                              <input
                                id={inputId}
                                type="file"
                                accept={accept}
                                className="tw-hidden"
                                disabled={savingAssetRole !== null}
                                onChange={(event) => handleUploadAsset(assetRole.roleKey, event)}
                              />
                              <label
                                htmlFor={inputId}
                                className={`btn btn-primary btn-sm tw-mb-0 ${savingAssetRole !== null ? 'tw-pointer-events-none tw-opacity-50' : 'tw-cursor-pointer'}`}
                              >
                                {uploadLabel}
                              </label>
                            </>
                          )}
                          {assetRole.asset && (
                            <a
                              className="btn btn-outline-dark btn-sm"
                              href={`${getServerURL()}/api/organization/document-assets/${encodeURIComponent(assetRole.roleKey)}/content`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          )}
                          {assetRole.asset && canManageDocumentAssets && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm tw-text-red-600"
                              disabled={savingAssetRole !== null}
                              onClick={() => removeDocumentAsset(assetRole)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="tw-mt-3 tw-mb-0 tw-text-xs tw-text-gray-400">
                          {assetRole.acceptedMimeTypes.map((mime) => mime.replace('image/', '').replace('application/', '')).join(', ').toUpperCase()} · up to {(assetRole.maxBytes / (1024 * 1024)).toFixed(0)} MB
                        </p>
                      </section>
                    );
                  })}
                </div>
              )}

              {!isLoadingAssets && !canManageDocumentAssets && (
                <p className="tw-mt-4 tw-mb-0 tw-text-xs tw-text-gray-500">An administrator or director can replace these files.</p>
              )}
            </div>
          </div>
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
