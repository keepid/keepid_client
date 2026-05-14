import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';

async function fetchDocumentsCount(): Promise<number> {
  const res = await fetch(`${getServerURL()}/get-files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ fileType: FileType.IDENTIFICATION_PDF }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || 'Request failed');
  }
  return Array.isArray(json.documents) ? json.documents.length : 0;
}

async function fetchApplicationsCount(): Promise<number> {
  // Applications live in their own table post-slice-12 — /get-files with
  // fileType=APPLICATION_PDF returns [] by design. /list-applications
  // is the right endpoint (same one ViewApplications.tsx uses for the
  // table itself), and the response is a flat array of rows visible to
  // the caller (client sees own; staff sees the whole org).
  const res = await fetch(`${getServerURL()}/list-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  });
  if (res.status === 404) {
    // Server hasn't been deployed with /list-applications yet — render
    // 0 (clickable) instead of erroring out. Matches the resilience
    // pattern in ViewApplications.loadDocuments.
    return 0;
  }
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || 'Request failed');
  }
  return Array.isArray(json) ? json.length : 0;
}

function countPhrase(count: number, singular: string, plural: string): string {
  if (count === 0) {
    return `You have no ${plural} yet`;
  }
  if (count === 1) {
    return `You have 1 ${singular}`;
  }
  return `You have ${count} ${plural}`;
}

interface SummaryCardProps {
  to: string;
  title: string;
  summaryLine: string | null;
  summaryLoading: boolean;
  summaryError: boolean;
  icon: React.ReactElement;
}

function SummaryCard({
  to,
  title,
  summaryLine,
  summaryLoading,
  summaryError,
  icon,
}: SummaryCardProps): React.ReactElement {
  let summaryBody: React.ReactNode;
  if (summaryLoading) {
    summaryBody = (
      <span
        className="tw-inline-block tw-h-4 tw-w-44 tw-animate-pulse tw-rounded tw-bg-gray-200"
        aria-hidden
      />
    );
  } else if (summaryError) {
    summaryBody = <span className="tw-text-gray-500">Summary unavailable</span>;
  } else {
    summaryBody = <span>{summaryLine}</span>;
  }

  return (
    <Link
      to={to}
      className="tw-group tw-box-border tw-flex tw-h-full tw-min-h-[132px] tw-flex-row tw-items-center tw-gap-5 tw-rounded-2xl tw-border-[1px] tw-border-solid tw-border-gray-400 tw-bg-white tw-p-6 tw-text-left tw-text-inherit tw-no-underline tw-shadow-[0_6px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)] tw-transition-all tw-duration-200 hover:-tw-translate-y-0.5 hover:tw-border-gray-500 hover:tw-shadow-[0_16px_48px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.06)] focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500 focus-visible:tw-ring-offset-2"
    >
      <div className="tw-flex tw-min-w-0 tw-flex-1 tw-flex-col tw-gap-2">
        <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900">{title}</h3>
        <div className="tw-text-sm tw-font-medium tw-text-gray-800">
          {summaryBody}
        </div>
        <span className="tw-mt-1 tw-text-sm tw-font-semibold tw-text-twprimary group-hover:tw-text-blue-700">
          Open
          <span aria-hidden className="tw-ml-1 tw-inline-block tw-transition-transform group-hover:tw-translate-x-0.5">
            →
          </span>
        </span>
      </div>
      <div
        className="tw-flex tw-shrink-0 tw-rounded-2xl tw-border tw-border-blue-100/80 tw-bg-blue-50 tw-p-4 tw-text-twprimary tw-shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] tw-transition-colors group-hover:tw-border-blue-200 group-hover:tw-bg-blue-100"
        aria-hidden
      >
        {icon}
      </div>
    </Link>
  );
}

type CountLoadState =
  | { status: 'loading' }
  | { status: 'ready'; count: number }
  | { status: 'error' };

export default function ClientDashboardSummaryCards(): React.ReactElement {
  const [documents, setDocuments] = useState<CountLoadState>({ status: 'loading' });
  const [applications, setApplications] = useState<CountLoadState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;
    setDocuments({ status: 'loading' });
    setApplications({ status: 'loading' });
    Promise.allSettled([fetchDocumentsCount(), fetchApplicationsCount()]).then(
      (results) => {
        if (cancelled) {
          return;
        }
        const [docResult, appResult] = results;
        if (docResult.status === 'fulfilled') {
          setDocuments({ status: 'ready', count: docResult.value });
        } else {
          setDocuments({ status: 'error' });
        }
        if (appResult.status === 'fulfilled') {
          setApplications({ status: 'ready', count: appResult.value });
        } else {
          setApplications({ status: 'error' });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const docSummary =
    documents.status === 'ready'
      ? countPhrase(documents.count, 'document', 'documents')
      : null;
  const appSummary =
    applications.status === 'ready'
      ? countPhrase(applications.count, 'application', 'applications')
      : null;

  return (
    <div className="tw-mt-5 tw-w-full">
      <div className="tw-grid tw-grid-cols-1 tw-gap-6 lg:tw-grid-cols-2 lg:tw-gap-8">
        <div className="tw-min-w-0">
          <SummaryCard
            to="/my-documents"
            title="Documents"
            summaryLine={docSummary}
            summaryLoading={documents.status === 'loading'}
            summaryError={documents.status === 'error'}
            icon={<DocumentTextIcon className="tw-h-11 tw-w-11" strokeWidth={1.5} />}
          />
        </div>
        <div className="tw-min-w-0">
          <SummaryCard
            to="/applications"
            title="Applications"
            summaryLine={appSummary}
            summaryLoading={applications.status === 'loading'}
            summaryError={applications.status === 'error'}
            icon={(
              <ClipboardDocumentListIcon
                className="tw-h-11 tw-w-11"
                strokeWidth={1.5}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
