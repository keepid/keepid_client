import React from "react";
import DatePicker from "react-datepicker";
import validUrl from "valid-url";

const MIN_PASSWORD_LENGTH: number = 8;
const MAX_PASSWORD_LENGTH: number = 128;

const validCharacters: string = 
    "a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð";
const emailPattern: RegExp = 
    new RegExp("^[" + validCharacters + "0-9_!#$%&’*+=?`{|}~^.-]{1,150}@[a-zA-Z0-9.-]{1,150}$");
const phoneNumberPattern: RegExp =
    new RegExp("^(\\+)?\\(?(1)?\\)?(-)?(\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)(-)?\\d{3}-?\\d{4})$");
const birthDatePattern: RegExp = new RegExp("^[0-9]{2}-[0-9]{2}-[0-9]{4}$");
const zipCodePattern: RegExp = new RegExp("^([0-9]{5}(?:-[0-9]{4})?)$");
const cityPattern: RegExp =
        new RegExp(
            "^(["
                + validCharacters
                + "]{1,150}((\\s|-|.){0,150})["
                + validCharacters
                + "]{0,150})"
                + "{1,5}$");
const usStatePattern: RegExp =
    new RegExp("^(?:A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$");
const streetPattern: RegExp =
    new RegExp("^[" + validCharacters + ", .'\\-0-9]{1,150}$");
const usernamePattern: RegExp = 
    new RegExp("^[-" + validCharacters + "_0-9]{1,150}$");
const orgEINPattern: RegExp = 
    new RegExp("^([0-9]{2}(-)?[0-9]{7})$");
const namePattern: RegExp = 
    new RegExp("^[" + validCharacters + ", .'-]{1,150}$");

let isValidEmail = (input: string): boolean => {
    return input !== null 
        && !(input.trim() === "")
        && emailPattern.test(input);
}

let isValidPhoneNumber = (input: string): boolean => {
    return input !== null
        && !(input.trim() === "")
        && phoneNumberPattern.test(input);
}

let isValidBirthDate = (input: string): boolean => {
    if (input === null
        || (input.trim() === "")
        || !birthDatePattern.test(input)) {
        return false;
    }
    let parts = input.split("-");
    let dateObject = new Date(parseInt(parts[2]),parseInt(parts[0]) - 1, parseInt(parts[1])); 
    let now = Date.now();
    return dateObject.getTime() < now;
}

let isValidOrgWebsite = (input: string): boolean => {
    if (validUrl.isUri(input)) {
        return true;
    } else {
        return false;
    }
}

let isValidZipCode = (input: string): boolean => {
    return input !== null
        && !(input.trim() === "")
        && zipCodePattern.test(input);
}

let isValidCity = (input: string): boolean => {
    return input !== null
        && !(input.trim() === "")
        && cityPattern.test(input);
}

let isValidUSState = (input: string): boolean => {
    return input !== null
        && !(input.trim() === "")
        && usStatePattern.test(input);
}

let isValidAddress = (input: any): boolean => {
    return input !== null
        && !(input.trim() === "")
        && streetPattern.test(input);
}

let isValidUsername = (input: string): boolean => {
    return input !== null
    && !(input.trim() === "")
    && usernamePattern.test(input);
}

let isValidPassword = (input: string): boolean => {
    return input !== null
    && !(input.trim() === "")
    && input.length >= MIN_PASSWORD_LENGTH
    && input.length < MAX_PASSWORD_LENGTH;
}

let isValidOrgName = (input: string): boolean => {
    return input !== null
    && !(input.trim() === "")
    && streetPattern.test(input);
}

let isValidEIN = (input: string): boolean => {
    return input !== null
    && !(input.trim() === "")
    && orgEINPattern.test(input);
}

let isValidFirstName = (input: string): boolean => {
    return input !== null
    && !(input.trim() === "")
    && namePattern.test(input);
}

let isValidLastName = (input: string): boolean => {
    return input !== null
    && !(input.trim() === "")
    && namePattern.test(input);
}

export {isValidAddress, isValidBirthDate, isValidCity, isValidEmail, isValidOrgWebsite,
    isValidPhoneNumber, isValidUSState, isValidZipCode, isValidUsername, isValidPassword,
    isValidOrgName, isValidEIN, isValidFirstName, isValidLastName};
