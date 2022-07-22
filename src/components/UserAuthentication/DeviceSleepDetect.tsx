import React, { useEffect, useState } from 'react';

interface Props {
  timeOut: number,
  handleLogout: () => void,
}

function DeviceSleepDetect(props: Props): React.ReactElement {
  const { timeOut, handleLogout } = props;
  const [previousTime, setPreviousTime] = useState(0);
  let currentTime;
  // const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setInterval(() => {
      currentTime = (new Date()).getTime();
      setPreviousTime(currentTime);
    }, 3000);
  }, []);
  console.log(previousTime, currentTime);
  if (currentTime - previousTime > timeOut) {
    console.log('wake from sleep', previousTime, currentTime);
    // window.alert();
  }
  return (
    <h1>The component has been rendered for {previousTime} seconds</h1>
  );
}

export default DeviceSleepDetect;
