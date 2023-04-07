import React, { useEffect, useRef, useState } from 'react';
import IdleTimer from 'react-idle-timer';
import { useHistory } from 'react-router-dom';

import DeviceSleepDetect from './DeviceSleepDetect';
import IdleTimeOutModal from './IdleTimeOutModal';

const timeUntilWarn: number = 1000 * 60 * 50; // 10 minutes
const timeFromWarnToLogout: number = 1000 * 60 * 10; // 5 minutes
const timeBeforeConsideredSleep: number = 1000 * 60 * 5; // 2 minutes

interface Props {
  logOut: () => void;
  setAutoLogout: (boolean) => void;
}

function AutoLogout(props: Props): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const [secondsIdle, setSecondsIdle] = useState(0);
  const [idleTimerWarn, setIdleTimerWarn] = useState<any>(undefined);
  const [logoutTimeout, setLogoutTimeout] = useState<any>(undefined);
  const history = useHistory();
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  const resetIdleTimer = (): void => {
    setSecondsIdle(0);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleAutoLogout, timeFromWarnToLogout);
  };

  const onIdle = (): void => {
    setShowModal(true);
    resetIdleTimer();
  };

  const onClose = (): void => {
    setShowModal(false);
    resetIdleTimer();
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsIdle((prevSecondsIdle) => prevSecondsIdle + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <IdleTimer
        key="idleTimerWarn"
        ref={(ref) => {
          setIdleTimerWarn(ref);
        }}
        element={document}
        onIdle={onIdle}
        debounce={250}
        timeout={timeUntilWarn}
        stopOnIdle
      />
      <IdleTimeOutModal showModal={showModal} handleClose={onClose} handleLogout={handleLogout} />
      <DeviceSleepDetect timeOut={timeBeforeConsideredSleep} handleAutoLogout={handleAutoLogout} />
    </div>
  );
}

export default AutoLogout;
