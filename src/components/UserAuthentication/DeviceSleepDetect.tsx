import React from 'react';

interface Props {
  timeOut: number,
  handleAutoLogout: () => void,
}

function DeviceSleepDetect(props: Props) {
  const { timeOut, handleAutoLogout } = props;
  let previousTime = (new Date()).getTime();
  setInterval(() => {
    const currentTime = (new Date()).getTime();
    if (currentTime - previousTime > timeOut) {
      handleAutoLogout();
    }
    previousTime = currentTime;
  }, 5000);
  return (
    null
  );
}

export default DeviceSleepDetect;
