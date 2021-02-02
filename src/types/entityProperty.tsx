import { DateInput, SelectInput, TextInput } from '../components/BaseComponents/Inputs';

export type EntityProperty = {
  label: string;
  propertyName: string;
  component: typeof TextInput | typeof SelectInput | typeof DateInput;
  inputProps?: Record<string, any>;
  isEditable: boolean;
  isCreatable: boolean;
};
