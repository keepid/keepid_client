import './ApplicationStartTabs.scss';

import { Tab } from '@headlessui/react';
import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { loadCaseSelector } from './applicationSelector/flowApi';
import { getOutcomeShortcuts } from './applicationSelector/outcomeShortcuts';
import type { SelectorFlow } from './applicationSelector/types';

interface Props {
  children: React.ReactNode;
  clientUsername?: string;
  clientName?: string;
  initialTab?: 'applications' | 'outcomes';
  onUpload?: () => void;
}

const outcomePresentation = {
  WEB_FORM: { label: 'Application form', Icon: DocumentTextIcon },
  PDF_UPLOAD: { label: 'PDF application', Icon: ArrowUpTrayIcon },
  INSTRUCTIONS_ONLY: { label: 'Instructions', Icon: ClipboardDocumentListIcon },
  ATTACHMENTS_ONLY: { label: 'Document packet', Icon: DocumentDuplicateIcon },
};

const OutcomeShortcuts = ({ clientUsername, clientName }: Pick<Props, 'clientUsername' | 'clientName'>) => {
  const [flow, setFlow] = useState<SelectorFlow | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    loadCaseSelector().then((loaded) => {
      if (active) setFlow(loaded);
    }).catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load outcome shortcuts.');
    });
    return () => { active = false; };
  }, [attempt]);

  if (error) {
    return (
      <div className="application-start__message application-start__message--error" role="alert">
        <p>{error}</p>
        <button type="button" className="application-start__secondary" onClick={() => setAttempt(attempt + 1)}>Try again</button>
      </div>
    );
  }
  if (!flow) return <p role="status" className="application-start__message">Loading outcome shortcuts…</p>;

  const shortcuts = getOutcomeShortcuts(flow);
  const search = query.trim().toLocaleLowerCase();
  const filtered = shortcuts.filter(({ outcome, labels }) => (
    [outcome.displayName, outcome.title, ...labels].join(' ').toLocaleLowerCase().includes(search)
  ));
  return (
    <div>
      {!clientUsername && (
        <p className="application-start__message">
          Open a client’s applications to use an outcome shortcut.
        </p>
      )}
      {shortcuts.length > 0 && (
        <div className="application-start__toolbar">
          <label className="application-start__search">
            <MagnifyingGlassIcon aria-hidden="true" />
            <input
              type="search"
              aria-label="Search outcomes"
              placeholder="Find an outcome…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="application-start__count" role="status">
            {filtered.length} {filtered.length === 1 ? 'outcome' : 'outcomes'}
          </span>
        </div>
      )}
      <div className="application-start__outcomes">
        {filtered.map(({ nodeId, outcome, labels }) => {
          const { label, Icon } = outcomePresentation[outcome.fulfillmentMode];
          const title = outcome.displayName || outcome.title;
          const content = (
            <>
              <span className="application-start__outcome-icon"><Icon aria-hidden="true" /></span>
              <span className="application-start__outcome-content">
                <span className="application-start__outcome-title">{title}</span>
                {labels.length > 0 && <span id={`outcome-route-${nodeId}`} className="application-start__route">{labels.join(' / ')}</span>}
                <span className="application-start__kind">{label}</span>
              </span>
              <ArrowRightIcon className="application-start__arrow" aria-hidden="true" />
            </>
          );
          return clientUsername ? (
            <Link
              key={nodeId}
              className="application-start__outcome"
              aria-label={title}
              aria-describedby={labels.length ? `outcome-route-${nodeId}` : undefined}
              to={{
                pathname: '/applications/selector',
                search: `?client=${encodeURIComponent(clientUsername)}`,
                state: {
                  clientUsername,
                  clientName: clientName || '',
                  outcomeShortcut: { nodeId, publishToken: flow.publishToken },
                },
              }}
            >
              {content}
            </Link>
          ) : <div key={nodeId} className="application-start__outcome application-start__outcome--disabled">{content}</div>;
        })}
      </div>
      {filtered.length === 0 && (
        <p className="application-start__message" role="status">
          {shortcuts.length ? 'No outcomes match your search.' : 'No outcome shortcuts are available in the published picker.'}
        </p>
      )}
    </div>
  );
};

const ApplicationStartTabs = ({ children, clientUsername, clientName, initialTab, onUpload }: Props) => (
  <section className="application-start" aria-label="Start a new application">
    <div className="application-start__header">
      <div>
        <h2>Start a new application</h2>
        <p>Choose an outcome to jump to its next steps.</p>
      </div>
      {clientUsername && (
        <Link
          className="application-start__secondary"
          to={{ pathname: '/applications/selector', state: { clientUsername, clientName: clientName || '' } }}
        >
          <MapIcon aria-hidden="true" />
          Use guided picker
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      )}
    </div>
    <Tab.Group defaultIndex={initialTab === 'applications' ? 1 : 0}>
      <Tab.List aria-label="Start a new application" className="application-start__tabs">
        {[
          { label: 'Outcome shortcuts', Icon: BoltIcon },
          { label: 'Application list', Icon: DocumentTextIcon },
        ].map(({ label, Icon }) => (
          <Tab key={label} className={({ selected }) => `application-start__tab${selected ? ' application-start__tab--selected' : ''}`}>
            <Icon aria-hidden="true" />
            {label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="application-start__panels">
        <Tab.Panel unmount={false}><OutcomeShortcuts clientUsername={clientUsername} clientName={clientName} /></Tab.Panel>
        <Tab.Panel>{children}</Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
    {onUpload && (
      <div className="application-start__footer">
        <span>Already have a completed application?</span>
        <button type="button" className="application-start__upload" onClick={onUpload}>
          <ArrowUpTrayIcon aria-hidden="true" />
          Upload PDF
        </button>
      </div>
    )}
  </section>
);

export default ApplicationStartTabs;
