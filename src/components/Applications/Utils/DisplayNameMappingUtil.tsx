import { ApplicationFormPage, formContent } from '../Hooks/ApplicationFormHook';

export function getDisplayName(value : string) : string {
  const foundOption = formContent
    .flatMap((page) => page.options)
    .find((option) => option.value === value);

  return foundOption ? foundOption.titleText : 'None';
}
