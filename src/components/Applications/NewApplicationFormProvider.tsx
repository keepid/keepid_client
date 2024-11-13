import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

const titles = {
  0: 'Page 1',
  1: 'Page 2',
  2: 'Page 3',
};

export type ApplicationType = 'ss_card' | 'drivers_license' | 'birth_cert' | 'voter_reg'
export type DataAttribute = 'type' | 'state' | 'situation' | 'person'

interface ApplicationOption {
  iconSrc: string,
  iconAlt: string,
  value: string,
  titleText: string,
  subtitleText: string | null,
  for: Set<ApplicationType> | null, // null indicates that this card is for ALL application types
}

interface SelectApplicationFormPage {
  title: string;
  subtitle?: string;
  dataAttr?: DataAttribute;
  options: ApplicationOption[];
}

const formContent: Record<number, SelectApplicationFormPage> = {
  0: {
    title: 'Start an Application',
    dataAttr: 'type',
    options: [
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Social Security Card',
        value: 'ss_card',
        titleText: 'Social Security Card',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Driver\'s License',
        value: 'drivers_license',
        titleText: 'Driver\'s License',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Birth Certificate',
        value: 'birth_cert',
        titleText: 'Birth Certificate',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Voter\'s Registration',
        value: 'voter_reg',
        titleText: 'Voter\'s Registration',
        subtitleText: null,
        for: null,
      },
    ],
  },
  1: {
    title: 'Select your State',
    dataAttr: 'state',
    options: [
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Pennsylvania',
        value: 'PA',
        titleText: 'Pennsylvania',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'New Jersey',
        value: 'NJ',
        titleText: 'New Jersey',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'New York / NYC',
        value: 'NY',
        titleText: 'New York / NYC',
        subtitleText: null,
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Federal',
        value: 'FED',
        titleText: 'Federal',
        subtitleText: null,
        for: null,
      },
    ],
  },
  2: {
    title: 'Select your Situation',
    dataAttr: 'situation',
    options: [
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Initial Application',
        value: 'initial',
        titleText: 'Initial Application',
        subtitleText: 'You have never applied or received an ID before',
        for: new Set(['ss_card', 'drivers_license']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Duplicate Application',
        value: 'duplicate',
        titleText: 'Duplicate Application',
        subtitleText: 'You have previously gotten this ID before but have lost or misplaced it',
        for: new Set(['ss_card']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Duplicate Application',
        value: 'duplicate',
        titleText: 'Duplicate Application',
        subtitleText: 'You have previously gotten this ID before but have lost or misplaced it, and the ID has not expired',
        for: new Set(['drivers_license']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Renewal Application',
        value: 'renewal',
        titleText: 'Renewal Application',
        subtitleText: 'You have previously gotten this ID before, but it has now expired',
        for: new Set(['drivers_license']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Change of Address',
        value: 'change_address',
        titleText: 'Change of Address',
        subtitleText: 'You just need to change the address on your ID',
        for: new Set(['drivers_license']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Standard Application',
        value: 'birth_cert_standard',
        titleText: 'Standard Application',
        subtitleText: 'You are applying through the standard process and are not homeless, juvenile, or a substance abuser',
        for: new Set(['birth_cert']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Homeless Application',
        value: 'birth_cert_homeless',
        titleText: 'Homeless Application',
        subtitleText: 'You are homeless so the application fee is waived',
        for: new Set(['birth_cert']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Juvenile Application',
        value: 'birth_cert_juvenile',
        titleText: 'Juvenile Application',
        subtitleText: 'You are under 18 so the application fee is waived',
        for: new Set(['birth_cert']),
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Substance Abuse Application',
        value: 'birth_cert_substance',
        titleText: 'Substance Abuse Application',
        subtitleText: 'You are actively substance abusing so the application fee is waived',
        for: new Set(['birth_cert']),
      },
    ],
  },
  3: {
    title: 'Select the target person',
    dataAttr: 'person',
    subtitle: 'I am filling out this application on behalf of...',
    options: [
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'Myself',
        value: 'myself',
        titleText: 'Myself',
        subtitleText: 'I am filling this application out for myself',
        for: null,
      },
      {
        iconSrc: '/apple-icon-180x180.png',
        iconAlt: 'My Child',
        value: 'mychild',
        titleText: 'My Child',
        subtitleText: 'I am filling this application out for my child or dependent',
        for: null,
      },
    ],
  },
  4: {
    title: 'Preview the Form',
    options: [],
  },
  5: {
    title: 'Last steps...',
    subtitle: 'Do you want to send the application with direct mail?',
    options: [],
  },
};

interface NewApplicationFormContextProps {
  formContent: Record<number, SelectApplicationFormPage>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  data: Record<DataAttribute, string>;
  setData: Dispatch<SetStateAction<Record<string, string>>>;
  canSubmit: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NewApplicationFormContext =
  createContext<NewApplicationFormContextProps>({} as NewApplicationFormContextProps);

export default function NewApplicationFormProvider({ children }) {
  const [page, setPage] = useState<number>(0);

  const [data, setData] = useState<Record<string, string>>({
    applicationType: '',
    state: '',
    situation: '',
    targetPerson: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.type;
    const name = e.target.name;
    const value = e.target.value;

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const canSubmit = [...Object.values(data)].every(Boolean) &&
    page === Object.keys(titles).length - 1;

  return (
    <NewApplicationFormContext.Provider
      value={{ formContent, page, setPage, data, setData, canSubmit, handleChange }}
    >
      {children}
    </NewApplicationFormContext.Provider>
  );
}
