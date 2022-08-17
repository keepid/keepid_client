import {
  isValidAddress,
  isValidBirthDate,
  isValidCity,
  isValidEIN,
  isValidEmail,
  isValidFirstName,
  isValidLastName,
  isValidOrgName,
  isValidOrgWebsite,
  isValidPassword,
  isValidPhoneNumber,
  isValidUSState,
  isValidZipCode,
} from '../../lib/Validations/Validations';

export const validateFirstname = (firstname: string): string => {
  if (!isValidFirstName(firstname)) {
    return 'Invalid first name';
  }
  return '';
};

export const validateLastname = (lastname: string): string => {
  if (!isValidLastName(lastname)) {
    return 'Invalid last name';
  }
  return '';
};

export const validateAddress = (address: string): string => {
  if (!isValidAddress(address)) {
    return 'Invalid address';
  }
  return '';
};

export const validateCity = (city: string): string => {
  if (!isValidCity(city)) {
    return 'Invalid city';
  }
  return '';
};

export const validateState = (state: string): string => {
  if (!isValidUSState(state)) {
    return 'Invalid state';
  }
  return '';
};

export const validateZipcode = (zipcode: string): string => {
  if (!isValidZipCode(zipcode)) {
    return 'Invalid zipcode';
  }
  return '';
};

export const validatePhonenumber = (phonenumber: string): string => {
  if (!isValidPhoneNumber(phonenumber)) {
    return 'Invalid phone number';
  }
  return '';
};

export const validateEmail = (email: string): string => {
  if (!isValidEmail(email)) {
    return 'Invalid email';
  }
  return '';
};

export const validatePassword = (password: string): string => {
  if (!isValidPassword(password)) {
    return 'Password must be at least 8 characters long.';
  }
  return '';
};

export const validateConfirmPassword = (
  confirmPassword: string,
  password: string,
): string => {
  if (confirmPassword !== password) {
    return 'Passwords do not match';
  }
  if (!isValidPassword(confirmPassword)) {
    return 'Password must be at least 8 characters long.';
  }
  return '';
};

export const validateEIN = (ein: string): string => {
  if (!isValidEIN(ein)) {
    return 'Invalid EIN';
  }
  return '';
};

export const validateOrgWebsite = (orgWebsite: string): string => {
  if (!isValidOrgWebsite(orgWebsite)) {
    return 'Invalid Website';
  }
  return '';
};

export const validateOrgName = (orgName: string): string => {
  if (!orgName) {
    return 'Organization Name cannot be blank';
  }
  if (!isValidOrgName(orgName)) {
    return 'Invalid Organization Name';
  }
  return '';
};
