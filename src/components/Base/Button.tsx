import React from 'react';

export enum ButtonStyle {
  DANGER = 'danger',
  SUCCESS = 'success',
  PRIMARY = 'primary'
}

interface Props {
  children?: JSX.Element | string;
  onClick: () => void;
  isLoading?: boolean;
  buttonStyle?: ButtonStyle;
}

const Button = ({
  buttonStyle, children, isLoading, onClick,
}: Props) => (
  <button
    type="submit"
    onClick={onClick}
    className={`btn btn-${buttonStyle} px-5 loginButtonBackground w-100 ld-ext-right ${isLoading ? 'running' : ''}`}
  >
    {children}
    <div className="ld ld-ring ld-spin" />
  </button>
);

const defaultProps = {
  buttonStyle: ButtonStyle.PRIMARY,
  children: null,
  isLoading: false,
};
Button.defaultProps = defaultProps;

export default Button;
