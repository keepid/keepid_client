import React from 'react';

import { ApplicationFormData } from './Hooks/ApplicationFormHook';

export default function ApplicationReviewPage({ data }: { data: ApplicationFormData }) {
  let appType;
  switch (data.type) {
    case 'SS':
      appType = 'social security card';
      break;
    case 'PIDL':
      appType = 'driver\'s license or photo id';
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

  let person;
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

  return (
    <div className="tw-mx-auto tw-bg-gray-100 tw-rounded-2xl tw-py-12 tw-px-20 tw-max-w-[1000px] tw-border-4 tw-border-gray-700">
      <ul className="tw-text-2xl tw-flex tw-flex-col tw-gap-4 tw-p-0 tw-m-0 tw-list-outside tw-pl-4">
        <li>You want an application for a <span className="tw-font-bold">{appType}</span>.</li>
        { data.state !== 'FED' && (<li>This application is for the state of <span className="tw-font-bold">{data.state}</span>.</li>)}
        <li>You are applying on behalf of <span className="tw-font-bold">{person}</span>.</li>
        <li>Your situation is <span className="tw-font-bold">{data.situation}</span></li>
      </ul>
    </div>
  );
}
