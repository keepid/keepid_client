import React from 'react';

import Role from '../../static/Role';
import HomepageGraphic from '../../static/images/homepage_graphic.svg';
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
    <div className="tw-w-full tw-my-auto">
      <div className="tw-container tw-max-w-7xl tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8 tw-py-8 md:tw-py-12">
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-5 tw-gap-8 md:tw-gap-12 tw-items-center">
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-4 md:tw-gap-5 md:tw-col-span-3">
            <div className="tw-w-full tw-max-w-[12rem] md:tw-max-w-xs lg:tw-max-w-md md:tw-self-center">
              <img
                alt="Document Platform"
                src={HomepageGraphic}
                className="tw-w-full tw-h-auto tw-object-contain"
              />
            </div>

            <div className="tw-w-full tw-max-w-md">
              <div className="tw-text-center">
                <h1
                  id="brand-header"
                  className="tw-mb-0 tw-font-raleway tw-font-bold tw-leading-tight tw-text-4xl md:tw-text-5xl"
                >
                  {brandHeader}
                </h1>
              </div>
              <p className="tw-pt-2 tw-pb-1 tw-text-center tw-text-xl md:tw-text-2xl tw-leading-snug">
                {subHeader}
              </p>
            </div>
          </div>

          <div className="tw-flex tw-items-start tw-justify-center tw-pt-4 md:tw-pt-0 md:tw-col-span-2">
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
    </div>
  );
}

export default HeroAuthSection;
