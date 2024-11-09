import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

interface NewApplicationFormContextProps {
  titles: Record<number, string>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  data: Record<string, string>;
  setData: Dispatch<SetStateAction<Record<string, string>>>;
  canSubmit: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const titles = {
  0: 'Page 1',
  1: 'Page 2',
};

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
      value={{ titles, page, setPage, data, setData, canSubmit, handleChange }}
    >
      {children}
    </NewApplicationFormContext.Provider>
  );
}
