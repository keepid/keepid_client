export enum UserType {
  DIRECTOR = 'Director',
  ADMIN = 'Admin',
  WORKER = 'Worker',
  CLIENT = 'Client',
  DEVELOPER = 'Developer'
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
  password: string;
  userType: UserType;
  twoFactorOn: boolean;
  creationDate: string;
  logInHistory: object[];
// TODO figure out why there are conflicting ESLint rules here:
// eslint-disable-next-line
};
