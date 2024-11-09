import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

const titles = {
  0: 'Page 1',
  1: 'Page 2',
  2: 'Page 3',
};

export type ApplicationType = 'ss_card' | 'drivers_license' | 'birth_cert' | 'voter_reg'

interface CardInfo {
  iconSrc: string,
  iconAlt: string,
  dataAttr: string,
  value: string,
  titleText: string,
  subtitleText: string | null,
  for: Set<ApplicationType> | null, // null indicates that this card is for ALL application types
}

const cards: Record<number, CardInfo[]> = {
  0: [
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'ss_card',
      titleText: 'Social Security Card',
      subtitleText: null,
      for: null,
    },
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'drivers_license',
      titleText: 'Driver\'s License',
      subtitleText: null,
      for: null,
    },
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'birth_cert',
      titleText: 'Birth Certificate',
      subtitleText: null,
      for: null,
    },
    {
      iconSrc: '/apple-icon-180x180.png',
      iconAlt: 'Social Security Card',
      dataAttr: 'applicationType',
      value: 'voter_reg',
      titleText: 'Voter\'s Registration',
      subtitleText: null,
      for: null,
    },
  ],
  1: [
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA',
      titleText: 'Pennsylvania1',
      subtitleText: null,
      for: null,
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA1',
      titleText: 'Pennsylvania2',
      subtitleText: null,
      for: null,
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA2',
      titleText: 'Pennsylvania3',
      subtitleText: null,
      for: null,
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'PA3',
      titleText: 'Pennsylvania4',
      subtitleText: null,
      for: null,
    },
  ],
  2: [
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'key1',
      titleText: 'SS_card Option',
      subtitleText: null,
      for: new Set(['ss_card']),
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'key2',
      titleText: 'SS_card Option2',
      subtitleText: null,
      for: new Set(['ss_card']),
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'key3',
      titleText: 'Driver\'s license option',
      subtitleText: null,
      for: new Set(['drivers_license']),
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'key4',
      titleText: 'Driver\'s license and SSC option',
      subtitleText: null,
      for: new Set(['ss_card', 'drivers_license']),
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'key5',
      titleText: 'Birth Certificate Option',
      subtitleText: null,
      for: new Set(['birth_cert']),
    },
    {
      iconSrc: '/link-logo.png',
      iconAlt: 'Pennsylvania',
      dataAttr: 'state',
      value: 'key6',
      titleText: 'Option for all types',
      subtitleText: null,
      for: null,
    },
  ],
};

interface NewApplicationFormContextProps {
  titles: Record<number, string>;
  cards: Record<number, CardInfo[]>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  data: Record<string, string>;
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
      value={{ titles, cards, page, setPage, data, setData, canSubmit, handleChange }}
    >
      {children}
    </NewApplicationFormContext.Provider>
  );
}
