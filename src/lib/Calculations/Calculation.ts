let calculateAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    if (today.getMonth() <= birthday.getMonth()) {
        if (today.getDay() < birthday.getDay()) {
            age--;
        }
    }
    return age;
}

let calculateAgeFromString = (birthday: string): any => {
    if (!birthday) return null;
    const today = new Date();
    const dateArr = birthday.split('-');
    const year = parseInt(dateArr[2]);
    const month = parseInt(dateArr[0]);
    const day = parseInt(dateArr[1]);
    let age = today.getFullYear() - year;
    if (today.getMonth() <= month) {
        if (today.getDay() < day) {
            age--;
        }
    }
    return age;
}

export {
    calculateAge, calculateAgeFromString
}