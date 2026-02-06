import React, { useCallback, useEffect, useState } from 'react';

import getServerURL from '../../serverOverride';

type Props = {
  organizationName: string;
};

type OrgInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export default function OrganizationInfoSection({ organizationName }: Props) {
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgInfo = useCallback(async (signal?: AbortSignal) => {
    if (!organizationName || organizationName.trim() === '') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${getServerURL()}/get-organization-info`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName: organizationName }),
        signal,
      });
      const json = await res.json();
      if (json?.status === 'SUCCESS') {
        setOrgInfo({
          name: json.name || '',
          address: json.address || '',
          phone: json.phone || '',
          email: json.email || '',
        });
      } else {
        setOrgInfo(null);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setOrgInfo(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [organizationName]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrgInfo(controller.signal);
    return () => controller.abort();
  }, [fetchOrgInfo]);

  if (isLoading) {
    return (
      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <h5 className="card-title tw-mb-0">Organization Information</h5>
          <p className="tw-mb-0 tw-text-gray-500 tw-mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!orgInfo) {
    return null;
  }

  const hasAnyInfo = orgInfo.name || orgInfo.address || orgInfo.phone || orgInfo.email;
  if (!hasAnyInfo) {
    return null;
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <h5 className="card-title tw-mb-0">Organization Information</h5>
        <hr />

        {orgInfo.name && (
          <div className="row tw-mb-2 tw-mt-1">
            <div className="col-3 card-text mt-2 text-primary-theme">Name</div>
            <div className="col-9 card-text tw-pt-2">{orgInfo.name}</div>
          </div>
        )}

        {orgInfo.address && (
          <div className="row tw-mb-2 tw-mt-1">
            <div className="col-3 card-text mt-2 text-primary-theme">Address</div>
            <div className="col-9 card-text tw-pt-2">{orgInfo.address}</div>
          </div>
        )}

        {orgInfo.phone && (
          <div className="row tw-mb-2 tw-mt-1">
            <div className="col-3 card-text mt-2 text-primary-theme">Phone</div>
            <div className="col-9 card-text tw-pt-2">{orgInfo.phone}</div>
          </div>
        )}

        {orgInfo.email && (
          <div className="row tw-mb-2 tw-mt-1">
            <div className="col-3 card-text mt-2 text-primary-theme">Email</div>
            <div className="col-9 card-text tw-pt-2">{orgInfo.email}</div>
          </div>
        )}
      </div>
    </div>
  );
}
