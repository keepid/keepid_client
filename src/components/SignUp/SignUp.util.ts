export const birthDateStringConverter = (birthDate: Date): string => {
  const personBirthMonth = birthDate.getMonth() + 1;
  const personBirthMonthString =
    personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth;
  const personBirthDay = birthDate.getDate();
  const personBirthDayString =
    personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay;
  const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
  return personBirthDateFormatted;
};
const urlPattern: RegExp = new RegExp(
  '^(http:www.)|(https:www.)|(http:(.*)|https:)(.*)$',
);

export const formatUrl = (url: string): string => {
  if (!urlPattern.test(url)) {
    return `http://${url}`;
  }
  return url;
};

export const onPropertyChange = (obj, setter) => (property, value) => {
  setter({ ...obj, [property]: value });
};

export const addHttp = (url: string):string => {
  if (!urlPattern.test(url)) {
    return `http://${url}`;
  }
  return url;
};
