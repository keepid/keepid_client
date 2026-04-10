const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

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

/** Parses YYYY-MM-DD from a native date input as a local calendar date (not UTC midnight). */
export function localDateFromIsoDateOnly(value: string): Date | undefined {
  const v = value.trim();
  const match = v.match(ISO_DATE_ONLY);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return undefined;
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return undefined;
  }
  return d;
}

/** Converts HTML date input value (YYYY-MM-DD) to API birthDate string MM-dd-yyyy. */
export function birthDateStringFromIsoDateOnly(value: string): string | undefined {
  const d = localDateFromIsoDateOnly(value);
  return d === undefined ? undefined : birthDateStringConverter(d);
}

const urlPattern: RegExp = /^(http:www.)|(https:www.)|(http:(.*)|https:)(.*)$/;

export const formatUrl = (url: string): string => {
  if (!urlPattern.test(url)) {
    return `http://${url}`;
  }
  return url;
};

export const onPropertyChange = (obj, setter) => (property, value) => {
  setter({ ...obj, [property]: value });
};
