import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

interface ApplicationFormContextProps {
  formContent: ApplicationFormPage[];
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  data: ApplicationFormData;
  setData: Dispatch<SetStateAction<ApplicationFormData>>;
  dataIsComplete: boolean;
  isDirty: boolean;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  handleChange: (name: string, value: string) => void;
  handlePrev: () => void;
  handleNext: () => void;
}

export const ApplicationFormContext =
  createContext<ApplicationFormContextProps>({} as ApplicationFormContextProps);

export function useApplicationFormContext() {
  return useContext(ApplicationFormContext);
}

export type ApplicationType = 'SS' | 'PIDL' | 'BC' | 'VR'

const initialData = {
  type: '',
  state: '',
  situation: '',
  person: '',
  org: 'Face to Face',
};

const DATA_FIELD_COUNT = Object.keys(initialData).length;

type DataAttribute = keyof typeof initialData;
export type ApplicationFormData = typeof initialData;

interface ApplicationOption {
  iconSrc: string,
  iconAlt: string,
  value: string,
  titleText: string,
  subtitleText: string | null,
  for: Set<ApplicationType> | null, // null indicates that this option is for ALL application types
}

type ApplicationPageName = 'type'
  | 'state'
  | 'person'
  | 'person'
  | 'situation'
  | 'review'
  | 'preview'
  | 'send'

export interface ApplicationFormPage {
  pageName: ApplicationPageName;
  title: (appType: string) => string;
  subtitle?: string;
  dataAttr?: DataAttribute;
  options: ApplicationOption[];
}

export const formContent: ApplicationFormPage[] = [
  {
    pageName: 'type',
    title: (_) => 'Start an Application',
    dataAttr: 'type',
    options: [
      {
        iconSrc: '/SelectApplicationForm/social-sec-card.svg',
        iconAlt: 'Social Security Card',
        value: 'SS',
        titleText: 'Social Security Card',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/drivers-license.svg',
        iconAlt: 'Driver\'s License',
        value: 'PIDL',
        titleText: 'Driver\'s License/State ID',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/birth-cert.svg',
        iconAlt: 'Birth Certificate',
        value: 'BC',
        titleText: 'Birth Certificate',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/voter-reg.svg',
        iconAlt: 'Voter\'s Registration',
        value: 'VR',
        titleText: 'Voter\'s Registration',
        subtitleText: null,
        for: null,
      },
    ],
  },
  {
    pageName: 'state',
    title: (_) => 'Select your State',
    dataAttr: 'state',
    options: [
      {
        iconSrc: '/SelectApplicationForm/pennsylvania.svg',
        iconAlt: 'Pennsylvania',
        value: 'PA',
        titleText: 'Pennsylvania',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/new-jersey.svg',
        iconAlt: 'New Jersey',
        value: 'NJ',
        titleText: 'New Jersey',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/new-york-state.svg',
        iconAlt: 'New York / NYC',
        value: 'NY',
        titleText: 'New York / NYC',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/usa.svg',
        iconAlt: 'Federal',
        value: 'FED',
        titleText: 'Federal',
        subtitleText: null,
        for: null,
      },
    ],
  },
  {
    pageName: 'person',
    title: (_) => 'Select the Target Person',
    dataAttr: 'person',
    subtitle: 'I am filling out this application on behalf of...',
    options: [
      {
        iconSrc: '/SelectApplicationForm/myself.svg',
        iconAlt: 'Myself',
        value: 'MYSELF',
        titleText: 'Myself',
        subtitleText: 'I am filling this application out for myself',
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/my-child.svg',
        iconAlt: 'My Child',
        value: 'MYCHILD',
        titleText: 'My Child',
        subtitleText: 'I am filling this application out for my child or dependent',
        for: null,
      },
      {
        iconSrc: '/SelectApplicationForm/my-child.svg',
        iconAlt: 'Myself and my child/children',
        value: 'MYSELF_AND_MYCHILD',
        titleText: 'Myself and my child(ren)',
        subtitleText: 'I am filling this application out for myself and one or more of my children',
        for: null,
      },
    ],
  },
  {
    pageName: 'situation',
    title: (appType) => {
      switch (appType) {
        case 'ss_card': return 'Select your Social Security Card Situation';
        case 'drivers_license': return 'Select your Photo ID/Driver\'s License Situation';
        case 'birth_cert': return 'Select your Birth Certificate Situation';
        case 'voter_reg': return 'Select your Voter Registration Situation';
        default: return 'Select your Situation';
      }
    },
    dataAttr: 'situation',
    options: [
      {
        iconSrc: '/SelectApplicationForm/initial-application.svg',
        iconAlt: 'Initial Application',
        value: 'INITIAL',
        titleText: 'Initial Application',
        subtitleText: 'You have never applied or received an ID before',
        for: new Set(['SS']),
      },
      {
        iconSrc: '/SelectApplicationForm/initial-application.svg',
        iconAlt: 'Initial Application (Driver\'s License)',
        value: 'DL$INITIAL',
        titleText: 'Initial Application (Driver\'s License)',
        subtitleText: 'You have never applied or received an Driver\'s License before',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/initial-application.svg',
        iconAlt: 'Initial Application (Photo ID)',
        value: 'PI$INITIAL',
        titleText: 'Initial Application (Photo ID)',
        subtitleText: 'You have never applied or received a Photo ID before',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/duplicate-application.svg',
        iconAlt: 'Duplicate Application',
        value: 'REPLACEMENT',
        titleText: 'Duplicate Application',
        subtitleText: 'You have previously gotten this ID before but have lost or misplaced it',
        for: new Set(['SS']),
      },
      {
        iconSrc: '/SelectApplicationForm/duplicate-application.svg',
        iconAlt: 'Duplicate Application (Driver\'s License)',
        value: 'DL$DUPLICATE',
        titleText: 'Duplicate Application (Driver\'s License)',
        subtitleText: 'You have previously gotten a Driver\'s License before but have lost or misplaced it, and it has not expired',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/duplicate-application.svg',
        iconAlt: 'Duplicate Application (Photo ID)',
        value: 'PI$DUPLICATE',
        titleText: 'Duplicate Application (Photo ID)',
        subtitleText: 'You have previously gotten Photo ID before but have lost or misplaced it, and it has not expired',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/renewal-application.svg',
        iconAlt: 'Renewal Application (Driver\'s License)',
        value: 'DL$RENEWAL',
        titleText: 'Renewal Application (Driver\'s License)',
        subtitleText: 'You have previously gotten a Driver\'s License before, but it has now expired',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/renewal-application.svg',
        iconAlt: 'Renewal Application (Photo ID)',
        value: 'PI$RENEWAL',
        titleText: 'Renewal Application (Photo ID)',
        subtitleText: 'You have previously gotten a Photo ID before, but it has now expired',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/change-of-address.svg',
        iconAlt: 'Change of Address (Driver\'s License)',
        value: 'DL$CHANGE_OF_ADDRESS',
        titleText: 'Change of Address (Driver\'s License)',
        subtitleText: 'You just need to change the address on your Driver\'s License',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/change-of-address.svg',
        iconAlt: 'Change of Address (Photo ID)',
        value: 'PI$CHANGE_OF_ADDRESS',
        titleText: 'Change of Address (Photo ID)',
        subtitleText: 'You just need to change the address on your Photo ID',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/standard-application.svg',
        iconAlt: 'Standard Application',
        value: 'STANDARD',
        titleText: 'Standard Application',
        subtitleText: 'You are applying through the standard process and are not homeless, juvenile, or a substance abuser',
        for: new Set(['BC']),
      },
      {
        iconSrc: '/SelectApplicationForm/homeless-application.svg',
        iconAlt: 'Homeless Application',
        value: 'HOMELESS',
        titleText: 'Homeless Application',
        subtitleText: 'You are homeless so the application fee is waived',
        for: new Set(['BC']),
      },
      {
        iconSrc: '/SelectApplicationForm/juvenile-application.svg',
        iconAlt: 'Juvenile Application',
        value: 'JUVENILE_JUSTICE_INVOLVED',
        titleText: 'Juvenile Application',
        subtitleText: 'You are under 18 so the application fee is waived',
        for: new Set(['BC']),
      },
      {
        iconSrc: '/SelectApplicationForm/substance-abuse-application.svg',
        iconAlt: 'Substance Abuse Application',
        value: 'SUBSTANCE_ABUSE',
        titleText: 'Substance Abuse Application',
        subtitleText: 'You are actively substance abusing so the application fee is waived',
        for: new Set(['BC']),
      },
    ],
  },
  {
    pageName: 'review',
    title: (_) => 'Review your selections',
    options: [],
  },
  {
    pageName: 'preview',
    title: (_) => 'Review your application',
    options: [],
  },
  {
    pageName: 'send',
    title: (_) => 'Last steps...',
    options: [],
  },
];

export function ApplicationFormProvider({ children }) {
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<ApplicationFormData>(initialData);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const handlePrev = () => setPage((prev) => prev - 1);

  const handleNext = () => {
    setPage((prev) => prev + 1);
  };

  const handleChange = (name: string, value: string) => {
    if (data[name] !== value) {
      setIsDirty(true);
    }

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    handleNext();
  };

  const dataIsComplete = Object.keys(data).length === DATA_FIELD_COUNT;

  return (
    <ApplicationFormContext.Provider
      value={{
        formContent,
        page,
        setPage,
        data,
        setData,
        dataIsComplete,
        isDirty,
        setIsDirty,
        handleChange,
        handleNext,
        handlePrev,
      }}
    >
      {children}
    </ApplicationFormContext.Provider>
  );
}
