import validUrl from "valid-url";

const MIN_PASSWORD_LENGTH: number = 8;
const MAX_PASSWORD_LENGTH: number = 128;

const validCharacters: string =
    "a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð";
const emailPattern: RegExp =
    new RegExp("^[" + validCharacters + "0-9_!#$%&’*+=?`{|}~^.-]{1,150}@[a-zA-Z0-9.-]{1,150}$");
// Liberal in what we accept: anything that reduces to 10 digits (with an
// optional leading +1 or 1) is considered valid. The server's
// PhoneNumbers#toCanonical applies the same rule, so the FE validator
// rejecting "(215) 555-1212" while the server accepts it was the older
// source of the worker-card/profile drift bug.
const phoneDigitsOnly = (input: string): string => input.replace(/\D/g, "");
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
    if (input === null || input.trim() === "") return false;
    const parts = input.split("@");
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

let isValidPhoneNumber = (input: string): boolean => {
    if (input == null || input.trim() === "") return false;
    const digits = phoneDigitsOnly(input);
    const trimmed = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    return trimmed.length === 10;
}

let isValidBirthDate = (input: string): boolean => {
    if (input === null
        || (input.trim() === "")
        || !birthDatePattern.test(input)) {
        return false;
    }
    let parts = input.split("-");
    let dateObject = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
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

export {
    isValidAddress, isValidBirthDate, isValidCity, isValidEmail, isValidOrgWebsite,
    isValidPhoneNumber, isValidUSState, isValidZipCode, isValidUsername, isValidPassword,
    isValidOrgName, isValidEIN, isValidFirstName, isValidLastName
};
