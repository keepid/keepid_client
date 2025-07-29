import React from 'react';

import { ApplicationFormData } from './Hooks/ApplicationFormHook';

export default function ApplicationReviewPage({ data }: { data: ApplicationFormData }) {
  const emphasis = 'tw-font-bold';

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
