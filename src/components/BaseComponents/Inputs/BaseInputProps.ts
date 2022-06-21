/* eslint-disable semi */
import { InputWrapperProps } from './InputWrapper';

export default interface InputProps<T>
  extends Omit<InputWrapperProps, 'children'|'invalidMessage'> {
  /**
   * Optional className to apply to input component
   */
  className?: string | undefined;
  /**
   * Default value of the input
   */
  defaultValue?: T | undefined;
  /**
   * Optional callback invoked upon value change
   * @param value - The updated value of the input component
   */
  onChange?: (value: T) => void;
  /**
   * Optional placeholder value passed to the input
   */
  placeholder?: string | undefined;
  /**
   * Optional validation function, that takes as parameter the value of the input and returns the applicable error message string if value is invalid
   */
  validate?: ((value: T) => string | Promise<string>) | undefined;
  /**
   * The optional controlled value to pass to the input component
   */
  value?: T | undefined;
}
