import {
  DateInput,
  SelectInput,
  TextInput,
} from '../components/BaseComponents/Inputs';
import { EntityProperty } from './entityProperty';

export enum UserType {
  DIRECTOR = 'Director',
  ADMIN = 'Admin',
  WORKER = 'Worker',
  CLIENT = 'Client',
  DEVELOPER = 'Developer',
}

export default interface User {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  organization: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  username: string;
  password?: string;
  privilegeLevel: UserType;
  twoFactorOn: boolean;
  creationDate: string;
  logInHistory?: object[];
  // TODO figure out why there are conflicting ESLint rules here:
  // eslint-disable-next-line
}

export interface UserV2 {
  id: string;
  orgId: string;
  userType: UserType;
  creationDate: string;
  person: Person;
  basicInfo: BasicInfo;
  demographicInfo: DemographicInfo;
  familyInfo: FamilyInfo;
  veteranStatus: VeteranStatus;
}

export interface Person {

}

export interface BasicInfo {

}

export interface DemographicInfo {

}

export interface FamilyInfo {

}

export interface VeteranStatus {

}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface UserCreateRequest {
  username: string;
  organization: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

export const UserFields: EntityProperty[] = [
  {
    propertyName: 'username',
    label: 'Username',
    component: TextInput,
    isEditable: false,
    isCreatable: true,
  },
  {
    propertyName: 'password',
    label: 'Password',
    component: TextInput,
    isEditable: false,
    isCreatable: true,
  },
  {
    propertyName: 'firstName',
    label: 'First Name',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'lastName',
    label: 'Last Name',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'birthDate',
    label: 'Birth Date',
    component: DateInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'email',
    label: 'Email',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'phone',
    label: 'Phone Number',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'organization',
    label: 'Organization',
    component: TextInput,
    isEditable: false,
    isCreatable: true,
  },
  {
    propertyName: 'address',
    label: 'Street Address',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'city',
    label: 'City',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'state',
    label: 'State',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'zipcode',
    label: 'Zip Code',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'privilegeLevel',
    label: 'User Type',
    component: SelectInput,
    inputProps: {
      options: Object.keys(UserType).map((k) => ({
        label: k,
        value: UserType[k],
      })),
    },
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'twoFactorOn',
    label: '2FA Enabled',
    component: TextInput,
    inputProps: { disabled: true },
    isEditable: false,
    isCreatable: false,
  },
  {
    propertyName: 'creationDate',
    label: 'Creation Date',
    component: DateInput,
    inputProps: { disabled: true },
    isEditable: false,
    isCreatable: false,
  },
];
