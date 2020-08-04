import React from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const MIN_PASSWORD_LENGTH: number = 8;
const MAX_PASSWORD_LENGTH: number = 128;

const validCharacters: string = 
    "a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð";
const emailPattern: RegExp = 
    new RegExp("^[" + validCharacters + "0-9_!#$%&’*+=?`{|}~^.-]{1,150}@[a-zA-Z0-9.-]{1,150}$");
const phoneNumberPattern: RegExp =
    new RegExp("(\\+)?\\(?(1)?\\)?(-)?(\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)(-)?\\d{3}-?\\d{4})");
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
    new RegExp("^[" + validCharacters + ", .'-[0-9]]{1,150}$");

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

let isValidBirthDate = (input: Date): boolean => {
    var temp: string = input.toString();
    if (temp === null
        || !(temp.trim() === "")
        || !birthDatePattern.test(temp)) {
        return false;
    }

    // havent figure this out
    var dateFormat: DatePicker = new DatePicker("MM-dd-yyyy");
    try {
        dateFormat.setLenient(false);
        var date: Date = dateFormat.parse(input);
        var today: Date = new Date();
        // cant be born today
        if (date === today) {
            return false;
        }
        // cant be born in future
        if (date.getFullYear > today.getFullYear) {
            return false;
        } else if (date.getFullYear === today.getFullYear) { 
                if (date.getMonth > today.getMonth) {
                    return false;
                } else if (date.getMonth === today.getMonth 
                    && date.getDay > today.getDay) {
                    return false;
                }
        }
        return true;
    } catch (error) {
      return false;
    }
}

// function isValidBirthDate(mm: any, dd: any, yyyy: any): boolean {
//     if (mm == null
//         || dd == null
//         || yyyy == null
//         || mm.strip().isBlank()
//         || dd.strip().isBlank()
//         || yyyy.strip().isBlank()
//         || !birthDatePattern.test(mm)
//         || !birthDatePattern.test(dd)
//         || !birthDatePattern.test(yyyy)) {
//         return false;
//     }
//     var date: Date = new Date(parseInt(mm), parseInt(dd), parseInt(yyyy));
//     try {
//       dateFormat.setLenient(false);
//       var date: Date = dateFormat.parse(input);
//       return date.before(new Date());
//     } catch (error) {
//       return false;
//     }
// }

let isValidOrgWebsite = (input: string): boolean => {
    var validUrl = require('valid-url');
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

export {isValidAddress, isValidBirthDate, isValidCity, isValidEmail, isValidOrgWebsite,
    isValidPhoneNumber, isValidUSState, isValidZipCode};
