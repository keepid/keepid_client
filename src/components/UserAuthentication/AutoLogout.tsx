import React, { useState } from 'react';
import IdleTimer from 'react-idle-timer';
import { useHistory } from 'react-router-dom';

import DeviceSleepDetect from './DeviceSleepDetect';
import IdleTimeOutModal from './IdleTimeOutModal';

const timeUntilWarn: number = 1000 * 60 * 50; // 50 minutes in milliseconds
const timeFromWarnToLogout: number = 1000 * 60 * 10; // 10 minutes in milliseconds
const timeBeforeConsideredSleep: number = 1000 * 60 * 60; // one hour in milliseconds

interface Props {
  logOut: () => void;
  setAutoLogout: (boolean) => void;
}

function AutoLogout(props: Props): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const [idleTimerWarn, setIdleTimerWarn] = useState<any>(undefined);
  const [logoutTimeout, setLogoutTimeout] = useState<any>(undefined);
  const history = useHistory();

  const handleLogout = (): void => {
    // clear the logout timer
    clearTimeout(logoutTimeout);
    props.logOut();
    history.push('/login');
  };

  // automatically logged out
  const handleAutoLogout = (): void => {
    handleLogout();
    props.setAutoLogout(true);
  };

  const warnUserIdle = (): void => {
    setShowModal(true);
    // start the logout timer
    const timeout = setTimeout(handleAutoLogout, timeFromWarnToLogout);
    setLogoutTimeout(timeout);
  };

  // closing idle modal warning
  const handleClose = (): void => {
    // reset the logout timer
    clearTimeout(logoutTimeout);
    setShowModal(false);
    // reset the warn timer
    idleTimerWarn.reset();
  };

  return (
    <div>
      <IdleTimer
        key="idleTimerWarn"
        ref={(ref) => {
          setIdleTimerWarn(ref);
        }}
        element={document}
        onIdle={warnUserIdle}
        debounce={250}
        timeout={timeUntilWarn}
        stopOnIdle
      />
      <IdleTimeOutModal
        showModal={showModal}
        handleClose={handleClose}
        handleLogout={handleLogout}
      />
      <DeviceSleepDetect
        timeOut={timeBeforeConsideredSleep}
        handleAutoLogout={handleAutoLogout}
      />
    </div>
  );
}

export default AutoLogout;
