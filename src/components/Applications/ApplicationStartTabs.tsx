import { Tab } from '@headlessui/react';
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
}

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
      <div className="tw-rounded-md tw-border tw-border-red-200 tw-bg-red-50 tw-p-4" role="alert">
        <p className="tw-mb-3">{error}</p>
        <button type="button" className="btn btn-outline-dark" onClick={() => setAttempt(attempt + 1)}>Try again</button>
      </div>
    );
  }
  if (!flow) return <p role="status" className="tw-text-gray-600">Loading outcome shortcuts…</p>;

  const shortcuts = getOutcomeShortcuts(flow);
  const search = query.trim().toLocaleLowerCase();
  const filtered = shortcuts.filter(({ outcome, labels }) => (
    [outcome.displayName, outcome.title, ...labels].join(' ').toLocaleLowerCase().includes(search)
  ));
  return (
    <div>
      <p className="tw-mb-4 tw-text-sm tw-text-gray-600">
        Know the outcome? Skip the picker questions and go straight to the next steps.
        Any client details or uploads on that route will still be available.
      </p>
      {!clientUsername && (
        <p className="tw-rounded-md tw-bg-blue-50 tw-p-3 tw-text-sm tw-text-blue-950">
          Open a client’s applications to use an outcome shortcut.
        </p>
      )}
      {shortcuts.length > 0 && (
        <label className="tw-mb-4 tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Search outcomes
          <input
            type="search"
            className="form-control tw-mt-1"
            placeholder="Search by outcome or picker answer"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      )}
      <div className="tw-overflow-hidden tw-rounded-md tw-border tw-border-gray-200 tw-bg-white">
        {filtered.map(({ nodeId, outcome, labels }) => {
          const content = (
            <>
              <span className="tw-min-w-0">
                <span className="tw-block tw-font-medium tw-text-gray-900">{outcome.displayName || outcome.title}</span>
                {labels.length > 0 && <span className="tw-mt-1 tw-block tw-text-xs tw-text-gray-600">{labels.join(' → ')}</span>}
              </span>
              <span aria-hidden="true" className="tw-shrink-0 tw-text-twprimary">→</span>
            </>
          );
          const className = 'tw-flex tw-items-center tw-justify-between tw-gap-4 tw-border-b tw-border-gray-100 tw-px-4 tw-py-3 tw-text-sm last:tw-border-b-0';
          return clientUsername ? (
            <Link
              key={nodeId}
              className={`${className} tw-no-underline hover:tw-bg-blue-50 focus-visible:tw-ring-2 focus-visible:tw-ring-inset focus-visible:tw-ring-blue-500`}
              to={{
                pathname: '/applications/selector',
                search: `?client=${encodeURIComponent(clientUsername)}`,
                state: {
                  clientUsername,
                  clientName: clientName || '',
                  outcomeShortcut: { nodeId, publishToken: flow.publishToken },
                },
              }}
            >{content}
            </Link>
          ) : <div key={nodeId} className={`${className} tw-opacity-60`}>{content}</div>;
        })}
        {filtered.length === 0 && (
          <p className="tw-mb-0 tw-p-4 tw-text-sm tw-text-gray-600" role="status">
            {shortcuts.length ? 'No outcomes match your search.' : 'No outcome shortcuts are available in the published picker.'}
          </p>
        )}
      </div>
    </div>
  );
};

const ApplicationStartTabs = ({ children, clientUsername, clientName, initialTab }: Props) => (
  <Tab.Group defaultIndex={initialTab === 'outcomes' ? 1 : 0}>
    <Tab.List aria-label="Start a new application" className="tw-mb-4 tw-flex tw-border-b tw-border-gray-200">
      {['Application list', 'Outcome shortcuts'].map((label) => (
        <Tab
          key={label}
          className={({ selected }) => `tw-flex-1 tw-border-0 tw-border-b-2 tw-border-solid tw-bg-transparent tw-px-3 tw-py-3 tw-text-sm tw-font-semibold focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-inset focus-visible:tw-ring-blue-500 sm:tw-flex-none sm:tw-px-5 ${selected ? 'tw-border-blue-600 tw-text-twprimary' : 'tw-border-transparent tw-text-gray-600 hover:tw-text-gray-900'}`}
        >{label}
        </Tab>
      ))}
    </Tab.List>
    <Tab.Panels>
      <Tab.Panel>{children}</Tab.Panel>
      <Tab.Panel><OutcomeShortcuts clientUsername={clientUsername} clientName={clientName} /></Tab.Panel>
    </Tab.Panels>
  </Tab.Group>
);

export default ApplicationStartTabs;
