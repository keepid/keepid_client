import { ChangeEvent } from 'react';

export function performValidationWithCustomTarget(
  value: any,
  validate: ((value: any) => string | Promise<string>) | undefined,
  setInvalidMessage: (msg: string) => void,
  setValidityChecked: (check: boolean) => void,
  target: HTMLInputElement | undefined,
): Promise<void> {
  const handleMsg = (msg: string) => {
    setInvalidMessage(msg);
    setValidityChecked(true);
    target?.setCustomValidity(msg || '');
  };

  if (validate) {
    const msg = validate(value);

    if (typeof msg === 'string') {
      handleMsg(msg);
      return Promise.resolve();
    }

    return msg
      .catch((err) => err.message)
      .then((msg) => {
        handleMsg(msg);
      });
  }
  return Promise.resolve();
}

export function performValidation(
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
