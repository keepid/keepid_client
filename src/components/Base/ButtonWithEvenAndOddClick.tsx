import React, { useState } from 'react';

interface Props {
  label: string;
  onEvenClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onOddClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const ButtonWithEvenAndOddClick = ({ label, onEvenClick, onOddClick }: Props) => {
  const [clickCount, setClickCount] = useState(0);
  const executeOnClick = (e) => {
    const fn = (clickCount + 1) % 2 === 0 ? onEvenClick : onOddClick;
    fn(e);
    setClickCount(clickCount + 1);
  };
  return (
    <button onClick={executeOnClick}>{label}</button>
  );
};

export default ButtonWithEvenAndOddClick;
