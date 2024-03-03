import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import {
  ChartBarIcon,
  ClockIcon,
  HomeIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';

const navigation = [
  {
    name: 'Basic Information',
    href: '#',
    icon: UserIcon,
  },
  {
    name: 'Family Information',
    href: '#',
    icon: HomeIcon,
  },
  {
    name: 'Demographic Information',
    href: '#',
    icon: ChartBarIcon,
  },
  {
    name: 'Veteran Status Information',
    href: '#',
    icon: StarIcon,
  },
  {
    name: 'Recent Activity',
    href: '#',
    icon: ClockIcon,
  },
];

function NavBar({ setSection }) {
  return (
    <nav className="tw-flex-col tw-gap-y-7 tw-bg-indigo-400 tw-pt-10 tw-px-10 tw-pb-40">
      <a
        className="tw-font-bold hover:tw-no-underline hover:tw-text-white tw-pl-4 tw-text-white tw-text-lg"
        href="#"
        onClick={() => setSection('Basic Information')}
      >
        My Information
      </a>
      <ul className="tw--mx-10 tw-space-y-1 tw-pr-10 tw-list-none tw-pb-20 tw-pt-5">
        {navigation.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              onClick={() => setSection(item.name)}
              className="tw-text-white hover:tw-no-underline hover:tw-bg-gray-700 hover:tw-text-white tw-group tw-flex tw-gap-x-3 tw-rounded-md tw-p-2 tw-text-sm tw-leading-6 tw-font-semibold"
            >
              <item.icon
                className="tw-h-6 tw-w-6 tw-shrink-0 tw-text-white"
                aria-hidden="true"
              />
              {item.name}
            </a>
          </li>
        ))}
      </ul>
      <Link to="/dashboard">
        <button
          type="button"
          className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-black tw-shadow-sm tw-border-none hover:tw-bg-indigo-300 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
        >
          <ChevronLeftIcon className="tw-w-5" />
          Back to dashboard
        </button>
      </Link>
    </nav>
  );
}

export default NavBar;
