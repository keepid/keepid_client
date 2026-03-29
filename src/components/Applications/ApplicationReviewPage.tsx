import React from 'react';
import { Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import type { BuilderState } from '../InteractiveForms/types';
import { getInteractiveFormConfig } from './api/interactiveForm';
import { ApplicationFormData } from './Hooks/ApplicationFormHook';

export default function ApplicationReviewPage({ data, blankFormId }: { data: ApplicationFormData; blankFormId: string | null }) {
  const emphasis = 'tw-font-bold';
  const [builderState, setBuilderState] = React.useState<BuilderState | null>(null);
  const [loadingConfig, setLoadingConfig] = React.useState(false);

  React.useEffect(() => {
    if (!blankFormId) return;
    setLoadingConfig(true);
    getInteractiveFormConfig(blankFormId)
      .then((cfg) => {
        if (cfg.builderState) {
          let bs = cfg.builderState;
          if (typeof bs === 'string') {
            try { bs = JSON.parse(bs); } catch (e) { /* ignore */ }
          }
          setBuilderState(bs as unknown as BuilderState);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingConfig(false));
  }, [blankFormId]);

  let appType: string;

  switch (data.type) {
    case 'SS':
      appType = 'social security card';
      break;
    case 'PIDL':
      if (data.situation.startsWith('DL')) {
        appType = 'driver\'s license';
      } else {
        appType = 'photo id';
      }
      break;
    case 'BC':
      appType = 'birth certificate';
      break;
    case 'VR':
      appType = 'voter\'s registration';
      break;
    default:
      appType = '';
  }

  let person: string;

  switch (data.person) {
    case 'MYSELF':
      person = 'yourself';
      break;
    case 'MYCHILD':
      person = 'your child';
      break;
    case 'MYSELF_AND_MYCHILD':
      person = 'yourself and your child';
      break;
    default:
      person = '';
  }

  let situation: React.ReactElement | null = null;

  if (data.situation.includes('INITIAL')) {
    situation = <li>This is an application for a <span className={emphasis}>new</span> {appType}.</li>;
  } else if (data.situation.includes('REPLACEMENT')) {
    situation = <li>This is an application for a <span className={emphasis}>replacement</span> {appType}.</li>;
  } else if (data.situation.includes('DUPLICATE')) {
    situation = <li>This is an application for a <span className={emphasis}>duplicate</span> {appType}.</li>;
  } else if (data.situation.includes('CHANGE_OF_ADDRESS')) {
    situation = <li>This application is for <span className={emphasis}>changing the address</span> associated with your {appType}.</li>;
  } else if (data.situation.includes('STANDARD')) {
    situation = <li>This is the <span className={emphasis}>standard</span> application for a {appType}.</li>;
  } else if (data.situation.includes('HOMELESS')) {
    situation = <li>This {appType} appplication is for those who are <span className={emphasis}>homeless</span>.</li>;
  } else if (data.situation.includes('JUVENILE_JUSTICE_INVOLVED')) {
    situation = <li>This {appType} appplication is for those who <span className={emphasis}>under 18 years old</span>.</li>;
  } else if (data.situation.includes('SUBSTANCE_ABUSE')) {
    situation = <li>This {appType} appplication is for those who have <span className={emphasis}>abused substances</span>.</li>;
  }

  if (loadingConfig) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (builderState && builderState.preRequirements) {
    return (
      <div className="tw-mx-auto tw-bg-white tw-shadow-[0_4px_24px_rgba(0,0,0,0.06)] tw-rounded-2xl tw-p-10 tw-max-w-[800px] tw-border-2 tw-border-gray-100">
        <h2 className="tw-text-3xl tw-font-bold tw-text-gray-900 tw-mb-6 tw-pb-4 tw-border-b tw-border-gray-100">Important Prerequisites</h2>
        <div className="prose prose-lg max-w-none tw-text-gray-700 tw-prose-headings:text-gray-900 tw-prose-a:text-blue-600">
          <ReactMarkdown>{builderState.preRequirements}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-mx-auto tw-bg-gray-100 tw-rounded-2xl tw-py-12 tw-px-20 tw-max-w-[1000px] tw-border-4 tw-border-gray-700">
      <ul className="tw-text-2xl tw-flex tw-flex-col tw-gap-4 tw-p-0 tw-m-0 tw-list-outside tw-pl-4">
        <li>You want an application for a <span className={emphasis}>{appType}</span>.</li>
        { data.state !== 'FED' && (<li>This application is for the state of <span className={emphasis}>{data.state}</span>.</li>)}
        <li>You are applying on behalf of <span className={emphasis}>{person}</span>.</li>
        { situation && situation }
      </ul>
    </div>
  );
}
