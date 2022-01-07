import { ChangeEvent } from 'react';

export async function performValidationWithCustomTarget(
  value: any,
  validate: ((value: any) => string | Promise<string>) | undefined,
  setInvalidMessage: (msg: string) => void,
  setValidityChecked: (check: boolean) => void,
  target: HTMLInputElement | undefined,
) {
  if (validate) {
    const msgPromise = Promise.resolve(validate(value));
    msgPromise
      .catch((err) => err.message)
      .then((msg) => {
        setInvalidMessage(msg);
        setValidityChecked(true);
        target?.setCustomValidity(msg || '');
      });
  }
}

export async function performValidation(
  e: ChangeEvent<any>,
  validate: ((value: any) => string | Promise<string>) | undefined,
  setInvalidMessage: (msg: string) => void,
  setValidityChecked: (check: boolean) => void,
) {
  return performValidationWithCustomTarget(
    e?.target?.value,
    validate,
    setInvalidMessage,
    setValidityChecked,
    e.target,
  );
}
