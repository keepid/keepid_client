import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

import getServerURL from '../../../serverOverride';

interface ApplicationFormContextProps {
  formContent: Record<number, ApplicationFormPage>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  data: ApplicationFormData;
  setData: Dispatch<SetStateAction<ApplicationFormData>>;
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
};

type DataAttribute = keyof typeof initialData;
export type ApplicationFormData = typeof initialData;

interface ApplicationOption {
  iconSrc: string,
  iconAlt: string,
  value: string,
  titleText: string,
  subtitleText: string | null,
  for: Set<ApplicationType> | null, // null indicates that this card is for ALL application types
}

interface ApplicationFormPage {
  title: (appType: string) => string;
  subtitle?: string;
  dataAttr?: DataAttribute;
  options: ApplicationOption[];
}

<<<<<<< HEAD:src/components/Applications/NewApplicationFormProvider.tsx
<<<<<<< HEAD
const pageToBreadCrumbTitle = ['Application Type', 'State', 'Situation', 'Target Person', 'Preview Form', 'Send Application'];

=======
>>>>>>> 65562e29 (Update breadcrumbs to progress bar; enlarge text; add selection descriptors)
const formContent: Record<number, SelectApplicationFormPage> = {
=======
const formContent: Record<number, ApplicationFormPage> = {
>>>>>>> 9c99d039 (renamed Application files and folders for clarity):src/components/Applications/Hooks/ApplicationFormHook.tsx
  0: {
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
  1: {
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
  2: {
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
  3: {
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
        for: new Set(['SS', 'PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/duplicate-application.svg',
        iconAlt: 'Duplicate Application',
        value: 'DUPLICATE',
        titleText: 'Duplicate Application',
        subtitleText: 'You have previously gotten this ID before but have lost or misplaced it',
        for: new Set(['SS']),
      },
      {
        iconSrc: '/SelectApplicationForm/duplicate-application.svg',
        iconAlt: 'Duplicate Application',
        value: 'DUPLICATE',
        titleText: 'Duplicate Application',
        subtitleText: 'You have previously gotten this ID before but have lost or misplaced it, and the ID has not expired',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/renewal-application.svg',
        iconAlt: 'Renewal Application',
        value: 'RENEWAL',
        titleText: 'Renewal Application',
        subtitleText: 'You have previously gotten this ID before, but it has now expired',
        for: new Set(['PIDL']),
      },
      {
        iconSrc: '/SelectApplicationForm/change-of-address.svg',
        iconAlt: 'Change of Address',
        value: 'CHANGE_OF_ADDRESS',
        titleText: 'Change of Address',
        subtitleText: 'You just need to change the address on your ID',
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
  4: {
    title: (_) => 'Review your selections',
    options: [],
  },
  5: {
    title: (_) => 'Review your application',
    options: [],
  },
  6: {
    title: (_) => 'Last steps...',
    options: [],
  },
};

<<<<<<< HEAD:src/components/Applications/NewApplicationFormProvider.tsx
interface NewApplicationFormContextProps {
  formContent: Record<number, SelectApplicationFormPage>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
<<<<<<< HEAD
<<<<<<< HEAD
  data: FormData;
  setData: Dispatch<SetStateAction<FormData>>;
  pages,
  setPages,
=======
  data: ApplicationFormData;
  setData: Dispatch<SetStateAction<ApplicationFormData>>;
>>>>>>> 6e719945 (onChange changed to onClick, added warnings before navigating away)
  canSubmit: boolean;
=======
  data: ApplicationFormData;
  setData: Dispatch<SetStateAction<ApplicationFormData>>;
>>>>>>> 65562e29 (Update breadcrumbs to progress bar; enlarge text; add selection descriptors)
  handleChange: (name: string, value: string) => void;
  handlePrev: () => void;
  handleNext: () => void;
}

export const NewApplicationFormContext =
  createContext<NewApplicationFormContextProps>({} as NewApplicationFormContextProps);

export default function NewApplicationFormProvider({ children }) {
=======
export function ApplicationFormProvider({ children }) {
>>>>>>> 9c99d039 (renamed Application files and folders for clarity):src/components/Applications/Hooks/ApplicationFormHook.tsx
  const [page, setPage] = useState<number>(0);

  const [data, setData] = useState<ApplicationFormData>(initialData);

  const handlePrev = () => setPage((prev) => prev - 1);

<<<<<<< HEAD
  const handleNext = () => {
    if (page === 4) {
      console.log('Fetching pdf application registry');
      fetch(`${getServerURL()}/get-application-registry`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((resData) => console.log(resData))
        .catch((e) => console.log(e));
    }
    setPage((prev) => prev + 1);
  };
  // setData((prev) => ({ ...prev, [formContent[page].dataAttr!]: option.value }))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
=======
  const handleNext = () => setPage((prev) => prev + 1);
>>>>>>> 6e719945 (onChange changed to onClick, added warnings before navigating away)

  const handleChange = (name: string, value: string) => {
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    handleNext();
  };

  return (
    <ApplicationFormContext.Provider
      value={{ formContent, page, setPage, data, setData, handleChange, handleNext, handlePrev }}
    >
      {children}
    </ApplicationFormContext.Provider>
  );
}
