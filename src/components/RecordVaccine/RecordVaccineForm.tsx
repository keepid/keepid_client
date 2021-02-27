import axios from 'axios';
import React, { FormEvent, useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import getServerURL from '../../serverOverride';
import { User, UserType } from '../../types';

enum VaccineManufacturer {
  MODERNA = 'MODERNA',
  PFIZER = 'PFIZER'
}

enum Dose {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  NONE = 'NONE'
}

interface RecordVaccineBody {
  userId: string;
  orgName: string;
  date: string;
  manufacturer: VaccineManufacturer;
  dose: Dose;
  provider?: string;
  providerAddress?: string;
}

class VaccineAPI {
  static recordVaccine(userId: string, orgName: string, dateOfVaccination: Date, vaccineManufacturer: VaccineManufacturer, dose: Dose, provider?: string, providerAddress?: string): Promise<void> {
    const body: RecordVaccineBody = {
      userId,
      orgName,
      date: [dateOfVaccination.getFullYear(), dateOfVaccination.getMonth() + 1, dateOfVaccination.getDate()].join('-'),
      manufacturer: vaccineManufacturer,
      dose,
      provider,
      providerAddress,
    };
    return axios.post(`${getServerURL()}/record-dose`, body, { withCredentials: true }).then(console.log);
  }

  static getOrganizationMembers(): Promise<User[]> {
    return axios
      .post(`${getServerURL()}/get-organization-members`, {
        role: UserType.ADMIN,
        name: '',
        listType: 'clients',
      }, { withCredentials: true })
      .then((response) => response.data.people);
  }

  static getAuthUserInfo(): Promise<User> {
    return axios.post(`${getServerURL()}/get-user-info`, {}, { withCredentials: true })
      .then((response) => {
        const user: User = response.data;
        user.userType = response.data.userRole as UserType;
        return user;
      });
  }
}

interface InputProps<T> {
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  label: string;
  id: string;
}

// TODO extract to shared `TextInput` file
interface TextInputProps extends InputProps<string> {}

const TextInput = ({
  id, value, onChange, label, required,
}: TextInputProps) => (
  <>
    <Form.Label htmlFor={id}>{label}</Form.Label>
    <input className="form-control" type="text" value={value} id={id} onChange={(e) => onChange(e.target.value)} required={required} />
  </>
);

TextInput.defaultProps = { required: false };

// TODO extract to shared `SelectInput` file
interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps extends InputProps<string> {
  options: SelectOption[];
}

const SelectInput = ({
  id, value, onChange, label, required, options,
}: SelectInputProps) => (
  <>
    <Form.Label htmlFor={id}>{label}</Form.Label>
    <Select
      aria-label={`Select-${id}`}
      options={options}
      autoFocus
      closeMenuOnSelect
      onChange={(option) => onChange(option.value)}
      value={options.find((i) => i.value === value)}
      // menuPlacement="top"
      required={required}
      id={id}
    />
  </>
);

SelectInput.defaultProps = {
  required: false,
};

// TODO extract to shared `DateInput` file
interface DateInputProps extends InputProps<Date | undefined> {}
const DateInput = ({
  id, value, onChange, label, required,
}: DateInputProps) => (
  <>
    <Form.Label htmlFor={id}>{label}</Form.Label>
    <DatePicker
      id={id}
      onChange={onChange}
      selected={value}
      className="form-control form-purple"
      required={required}
    />
  </>
);

DateInput.defaultProps = { required: false };

const RecordVaccineForm = () => {
  const [userId, setUserId] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const [manufacturer, setManufacturer] = useState<VaccineManufacturer>(VaccineManufacturer.MODERNA);
  const [dose, setDose] = useState<Dose>(Dose.FIRST);
  const [provider, setProvider] = useState<string>('');
  const [providerAddress, setProviderAddress] = useState<string>('');

  const [initialized, setInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<User>();
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    if (!initialized) {
      VaccineAPI.getAuthUserInfo().then((authUser) => {
        setAuthUser(authUser);
        if (authUser?.userType === UserType.CLIENT) {
          setUserId(authUser.username);
          setMembers([authUser]);
          return Promise.resolve();
        }
        return VaccineAPI.getOrganizationMembers().then(setMembers);
      }).then(() => setInitialized(true));
    }
  });

  const userOptions = members.map((u) => ({
    label: [u.firstName, u.lastName].join(' '),
    value: u.username,
  }));

  const manufacturerOptions = Object.keys(VaccineManufacturer).map((k) => ({
    label: k,
    value: VaccineManufacturer[k],
  }));

  const doseOptions = Object.keys(Dose).map((k) => ({
    label: k,
    value: Dose[k],
  }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const orgName = authUser?.organization || '';

    console.log({
      userId, orgName, date, manufacturer, dose, provider, providerAddress,
    });

    // return VaccineAPI.recordVaccine(userId, orgName, date as Date, manufacturer, dose, provider, providerAddress);
  };

  return (
    <Container>
      <Form onSubmit={onSubmit}>
        {authUser?.userType !== UserType.CLIENT ? <SelectInput options={userOptions} value={userId} onChange={setUserId} label="Vaccine Recipient" id="userId" required /> : null}
        <DateInput value={date} onChange={setDate} label="Date of Vaccination" id="date" required />
        <SelectInput options={manufacturerOptions} value={manufacturer} onChange={(s) => setManufacturer(s as VaccineManufacturer)} label="Vaccine Manufacturer" id="manufacturer" />
        <SelectInput options={doseOptions} value={dose} onChange={(s) => setDose(s as Dose)} label="Vaccine Dose" id="dose" />
        <TextInput value={provider} onChange={setProvider} label="Provider" id="provider" />
        <TextInput value={providerAddress} onChange={setProviderAddress} label="Provider Address" id="providerAddress" />
        <br />
        <Button type="submit">Submit form</Button>
      </Form>
    </Container>
  );
};

export default RecordVaccineForm;
