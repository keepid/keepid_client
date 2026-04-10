import React from 'react';

import Role from '../../static/Role';
import LoginPage from '../UserAuthentication/LoginPage';

interface HeroAuthSectionProps {
  brandHeader: string;
  subHeader: string;
  logIn?: (
    role: Role,
    username: string,
    organization: string,
    name: string
  ) => void;
  logOut?: () => void;
  role?: Role;
  autoLogout?: boolean;
  setAutoLogout?: (logout: boolean) => void;
}

function HeroAuthSection({
  brandHeader,
  subHeader,
  logIn,
  logOut,
  role,
  autoLogout,
  setAutoLogout,
}: HeroAuthSectionProps) {
  return (
    <div className="tw-container-fluid tw-my-auto">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-center tw-items-center tw-img-fluid tw-gap-8 md:tw-gap-16 tw-py-16 md:tw-py-28">
        <div className="tw-flex tw-flex-col tw-px-4 tw-items-center tw-justify-center">
          <div className="tw-rounded tw-mb-3">
            <div className="tw-text-center">
              <span className="brand-text" id="brand-header">
                {brandHeader}
              </span>
            </div>
            <p className="tw-pt-4 tw-pb-2 tw-text-center md:tw-text-left home-subtext">
              {subHeader}
            </p>
          </div>
        </div>

        <div className="tw-flex tw-flex-col tw-items-center tw-px-5 tw-py-4 md:tw-py-0 tw-w-full md:tw-w-auto">
          {logIn && logOut && role !== undefined && autoLogout !== undefined && setAutoLogout ? (
            <LoginPage
              isLoggedIn={role !== Role.LoggedOut}
              logIn={logIn}
              logOut={logOut}
              role={role}
              autoLogout={autoLogout}
              setAutoLogout={setAutoLogout}
              embedded
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default HeroAuthSection;
