import { DateInput, TextInput } from '../components/BaseComponents/Inputs';
import { EntityProperty } from './entityProperty';

export default interface Organization {
  orgName: string;
  orgEmail: string;
  orgWebsite: string;
  orgEIN: string;
  orgStreetAddress: string;
  orgCity: string;
  orgState: string;
  orgZipcode: string;
  orgPhoneNumber: string;
  creationDate: string;
  id: string;
  // eslint-disable-next-line semi
}

export interface OrganizationUpdateRequest {
  orgEmail: string;
  orgWebsite: string;
  orgEIN: string;
  orgStreetAddress: string;
  orgCity: string;
  orgState: string;
  orgZipcode: string;
  orgPhoneNumber: string;
}

export interface OrganizationCreateRequest {
  orgName: string;
  orgEmail: string;
  orgWebsite: string;
  orgEIN: string;
  orgStreetAddress: string;
  orgCity: string;
  orgState: string;
  orgZipcode: string;
  orgPhoneNumber: string;
}

export const OrganizationProperties: EntityProperty[] = [
  {
    propertyName: 'orgName',
    label: 'Organization Name',
    component: TextInput,
    isEditable: false,
    isCreatable: true,
  },
  {
    propertyName: 'orgEmail',
    label: 'Organization Email',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgWebsite',
    label: 'Organization Website',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgEIN',
    label: 'Organization EIN',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgStreetAddress',
    label: 'Street Address',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgCity',
    label: 'City',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgState',
    label: 'State',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgZipcode',
    label: 'Zipcode',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
  },
  {
    propertyName: 'orgPhoneNumber',
    label: 'Phone Number',
    component: TextInput,
    isEditable: true,
    isCreatable: true,
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
