import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import BasicInformation from './BasicInformation';
import DemoInformation from './DemoInformation';
import FamilyInformation from './FamilyInformation';
import NavBar from './NavBar';
import RecentActivity from './RecentActivity';
import VeteranInformation from './VeteranInformation';

function MyInformation(username) {
  const [photo, setPhoto] = useState('');
  const [photoAvailable, setPhotoAvailable] = useState(false);
  const [section, setSection] = useState('Basic Information');
  const [postRequestMade, setPostRequestMade] = useState(false);
  const [myInfo, setMyInfo] = useState({
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    ssn: '',
    birthDate: '1900 12 12',
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
    race: 'UNSELECTED',
    cityOfBirth: '',
    stateOfBirth: '',
    countryOfBirth: '',
    citizenship: 'UNSELECTED',
    parents: [{ firstName: '' }, { firstName: '' }],
    legalGuardians: [],
    maritalStatus: 'UNSELECTED',
    spouse: { firstName: '' },
    children: [{ firstName: '' }, { firstName: '' }],
    siblings: [],
    isVeteran: false,
    isProtectedVeteran: false,
    branch: '',
    yearsOfService: '',
    rank: '',
    discharge: '',
  });
  const [initialData, setInitialData] = useState(myInfo);
  const alert = useAlert();
  const controllerRef = useRef(new AbortController());
  const location = useLocation();

  // if opt info does not exist get default user info
  const createOptInfo = () => {
    fetch(`${getServerURL()}/get-user-info`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const date = responseJSON.birthDate.toString().split('-');
        const birthday = new Date(date[2], date[0], date[1]);
        const birthdayString = format(birthday, 'yyyy mm dd');
        setMyInfo({
          ...myInfo,
          username: responseJSON.username,
          firstName: responseJSON.firstName,
          lastName: responseJSON.lastName,
          emailAddress: responseJSON.email,
          phoneNumber: responseJSON.phone,
          birthDate: birthdayString,
          mailingAddress: {
            ...myInfo.mailingAddress,
            city: responseJSON.city,
            state: responseJSON.state,
            streetAddress: responseJSON.address,
            zip: responseJSON.zipcode,
          },
        });
      })
      .then(() => {
        fetch(`${getServerURL()}/save-optional-info/`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(myInfo),
        })
          .then((response) => response.json())
          .then((responseJSON) => {
            const { status } = responseJSON;
            if (status === 'SUCCESS') {
              setPostRequestMade(true);
            } else {
              alert.show('Could not create optional information.');
            }
          });
      });
  };

  const loadProfilePhoto = () => {
    const signal = controllerRef.current?.signal;
    fetch(`${getServerURL()}/load-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: username.username,
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = (URL || window.webkitURL).createObjectURL(blob);
        if (url) {
          setPhoto(url);
          setPhotoAvailable(true);
        }
      })
      .catch((error) => {
        alert.show("Couldn't load profile photo.");
      });
  };

  const fetchUserProfile = () => {
    fetch(`${getServerURL()}/get-optional-info/${username.username}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'USER_NOT_FOUND') {
          // if user doesnt have opt info, then create opt info from user info
          createOptInfo();
        } else {
          const userDate = responseJSON.optionalUserInformation.birthDate;
          const newDate = format(userDate, 'yyyy MM dd');
          const newMyInfo = {
            username: responseJSON.username,
            firstName: responseJSON.basicInfo.firstName,
            middleName: responseJSON.basicInfo.middleName,
            lastName: responseJSON.basicInfo.lastName,
            ssn: responseJSON.basicInfo.ssn,
            birthDate: newDate,
            genderAssignedAtBirth: responseJSON.basicInfo.genderAssignedAtBirth,
            emailAddress: responseJSON.basicInfo.emailAddress,
            phoneNumber: responseJSON.basicInfo.phoneNumber,
            mailingAddress: {
              streetAddress:
                responseJSON.basicInfo.mailingAddress.streetAddress,
              apartmentNumber:
                responseJSON.basicInfo.mailingAddress.apartmentNumber,
              city: responseJSON.basicInfo.mailingAddress.city,
              state: responseJSON.basicInfo.mailingAddress.state,
              zip: responseJSON.basicInfo.mailingAddress.zip,
            },
            residentialAddress: {
              streetAddress:
                responseJSON.basicInfo.residentialAddress.streetAddress,
              apartmentNumber:
                responseJSON.basicInfo.residentialAddress.apartmentNumber,
              city: responseJSON.basicInfo.residentialAddress.city,
              state: responseJSON.basicInfo.residentialAddress.state,
              zip: responseJSON.basicInfo.residentialAddress.zip,
            },
            differentBirthName: responseJSON.basicInfo.differentBirthName,
            suffix: responseJSON.basicInfo.suffix,
            birthFirstName: responseJSON.basicInfo.birthFirstName,
            birthMiddleName: responseJSON.basicInfo.birthMiddleName,
            birthLastName: responseJSON.basicInfo.birthLastName,
            birthSuffix: responseJSON.basicInfo.birthSuffix,
            stateIdNumber: responseJSON.basicInfo.stateIdNumber,
            haveDisability: responseJSON.basicInfo.haveDisability,
            languagePreference: responseJSON.demographicInfo.languagePreference,
            isEthnicityHispanicLatino:
              responseJSON.demographicInfo.isEthnicityHispanicLatino,
            race: responseJSON.demographicInfo.race,
            cityOfBirth: responseJSON.demographicInfo.cityOfBirth,
            stateOfBirth: responseJSON.demographicInfo.stateOfBirth,
            countryOfBirth: responseJSON.demographicInfo.countryOfBirth,
            citizenship: responseJSON.demographicInfo.citizenship,
            parents: responseJSON.familyInfo.parents,
            legalGuardians: responseJSON.familyInfo.legalGuardians,
            maritalStatus: responseJSON.familyInfo.maritalStatus,
            spouse: responseJSON.familyInfo.spouse,
            children: responseJSON.familyInfo.children,
            siblings: responseJSON.familyInfo.siblings,
            isVeteran: responseJSON.veteranStatus.veteran,
            isProtectedVeteran: responseJSON.veteranStatus.protectedVeteran,
            branch: responseJSON.veteranStatus.branch,
            yearsOfService: responseJSON.veteranStatus.yearsOfService,
            rank: responseJSON.veteranStatus.rank,
            discharge: responseJSON.veteranStatus.discharge,
          };
          setMyInfo(newMyInfo);
          // save copy of my info to reset to when user navigates away from page
          setInitialData(newMyInfo);
          setPostRequestMade(false);
        }
      });
  };

  // reset back to initial state when location changes
  useEffect(() => {
    setMyInfo(initialData);
  }, [location]);

  // fetch user profile when POST request is made
  useEffect(() => {
    const fetchProfile = async () => {
      fetchUserProfile();
      loadProfilePhoto();
    };
    fetchProfile();
  }, [postRequestMade]);

  return (
    <div style={{ paddingBottom: '0', marginBottom: '0' }}>
      <Helmet>
        <title>My Information</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="tw-container tw-pb-0">
        <div className="tw-container tw-mx-auto tw-h-full">
          <div className="tw-flex tw-flex-row">
            <NavBar setSection={setSection} />
            <div className="tw-container tw-mx-auto">
              <div className="tw-place-items-center tw-flex-row tw-justify-end tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
                {!photoAvailable && (
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
                )}
                {photoAvailable && (
                  <img
                    className="tw-h-12 tw-rounded-full"
                    src={photo}
                    alt="User's profile picture"
                  />
                )}
                <p className="tw-m-0">{username.name}</p>
              </div>
              <hr className="tw-ml-10" />
              {section === 'Basic Information' && (
                <BasicInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                  loadProfilePhoto={loadProfilePhoto}
                  photo={photo}
                  photoAvailable={photoAvailable}
                  username={username}
                />
              )}
              {section === 'Family Information' && (
                <FamilyInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                  username={username}
                />
              )}
              {section === 'Demographic Information' && (
                <DemoInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                  username={username}
                />
              )}
              {section === 'Veteran Status Information' && (
                <VeteranInformation
                  data={myInfo}
                  setData={setMyInfo}
                  setPostRequestMade={setPostRequestMade}
                  username={username}
                />
              )}
              {section === 'Recent Activity' && (
                <RecentActivity username={username} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyInformation;
