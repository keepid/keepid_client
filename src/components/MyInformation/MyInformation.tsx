import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import BasicInformation from './BasicInformation';
import DemoInformation from './DemoInformation';
import FamilyInformation from './FamilyInformation';
import NavBar from './NavBar';
import RecentActivity from './RecentActivity';
import VeteranInformation from './VeteranInformation';

function MyInformation() {
  const [section, setSection] = useState('Basic Information');
  const [postRequestMade, setPostRequestMade] = useState(false);
  const [myInfo, setMyInfo] = useState({
    username: 'JohnDoe',
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    ssn: '123456',
    birthDate: '12 12 1990',
    genderAssignedAtBirth: '',
    emailAddress: '',
    phoneNumber: '',
    mailingAddress: {
      streetAddress: '',
      apartmentNumber: '',
      city: '',
      state: '',
      zip: '',
    },
    residentialAddress: {
      streetAddress: '',
      apartmentNumber: '',
      city: '',
      state: '',
      zip: '',
    },
    differentBirthName: false,
    suffix: '',
    birthFirstName: '',
    birthMiddleName: '',
    birthLastName: '',
    birthSuffix: '',
    stateIdNumber: '',
    haveDisability: false,
    languagePreference: '',
    isEthnicityHispanicLatino: false,
    race: '',
    cityOfBirth: '',
    stateOfBirth: '',
    countryOfBirth: '',
    citizenship: '',
    parents: [{ firstName: 'Jane' }, { firstName: 'Kevin' }],
    legalGuardians: [],
    maritalStatus: '',
    spouse: { firstName: 'Hannah' },
    children: [{ firstName: 'Mary' }, { firstName: 'John' }],
    siblings: [],
    isVeteran: false,
    isProtectedVeteran: false,
    branch: '',
    yearsOfService: '',
    rank: '',
    discharge: '',
  });

  // TODO
  const fetchRecentActivity = () => {};
  const fetchProfilePic = () => {};

  const fetchUserProfile = () => {
    fetch(`${getServerURL()}/get-optional-info/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        setMyInfo(responseJSON);
        setPostRequestMade(false);
      });
  };

  useEffect(() => {
    fetchUserProfile();
    fetchProfilePic();
  }, [postRequestMade]);

  return (
    <div>
      <Helmet>
        <title>My Information</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="md:container md:mx-auto">
        <div className="tw-container">
          <div className="tw-flex tw-flex-row">
            <NavBar setSection={setSection} />
            <div className="tw-container tw-mx-auto">
              <div className="tw-place-items-center tw-flex-row tw-justify-end tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
                <svg
                  className="tw-h-12 tw-w-12 tw-text-gray-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="tw-m-0">John Doe</p>
              </div>
              <hr className="tw-ml-10" />
              {section === 'Basic Information' && (
                <BasicInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                />
              )}
              {section === 'Family Information' && (
                <FamilyInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                />
              )}
              {section === 'Demographic Information' && (
                <DemoInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                />
              )}
              {section === 'Veteran Status Information' && (
                <VeteranInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                />
              )}
              {section === 'Recent Activity' && (
                <RecentActivity data={myInfo} setData={setMyInfo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyInformation;
