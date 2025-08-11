export function capitalizeFirst(str: string) {
  return str.length === 0 ? ''
    : str[0].toLocaleUpperCase() + str.slice(1);
}
