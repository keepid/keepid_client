export enum InputType {
  TEXT,
  PASSWORD,
  EMAIL,
  DATE,
  SELECT,
  // NUMBER
}

export type BaseInputFieldType<T> = {
  label: string;
  name: string;
  type: InputType;

  description?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  validate?: ((value: T) => string | Promise<string>) | undefined;
  inputProps?: Record<string, any> | undefined;
  defaultValue?: T | undefined;
};
