import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import DeviceSleepDetect from './DeviceSleepDetect';
import IdleTimeOutModal from './IdleTimeOutModal';

// const timeUntilWarn: number = 1000 * 60 * 60; // 1 hour
// const timeFromWarnToLogout: number = 1000 * 60 * 15; // 15 minutes
// const timeout: number = timeUntilWarn + timeFromWarnToLogout;
// const timeBeforeConsideredSleep: number = 1000 * 60 * 60 * 24 * 30; // 1 month

interface Props {
  logOut: () => void;
  setAutoLogout: (logout: boolean) => void;
  timeUntilWarn: number;
  timeFromWarnToLogout: number;
  timeBeforeConsideredSleep: number;
}

function AutoLogout(props: Props): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();
  const warnTimerRef = useRef<number | undefined>(undefined);
  const logoutTimerRef = useRef<number | undefined>(undefined);
  const hasLoggedOutRef = useRef(false);

  const handleLogout = (): void => {
    if (hasLoggedOutRef.current) return;
    hasLoggedOutRef.current = true;
    props.logOut();
    history.push('/login');
  };

  // automatically logged out
  const handleAutoLogout = (): void => {
    handleLogout();
    props.setAutoLogout(true);
  };

  const onActive = (): void => {
    setShowModal(false);
  };

  const clearTimers = (): void => {
    if (warnTimerRef.current) window.clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    warnTimerRef.current = undefined;
    logoutTimerRef.current = undefined;
  };

  const scheduleTimers = (): void => {
    clearTimers();
    warnTimerRef.current = window.setTimeout(() => {
      setShowModal(true);
    }, props.timeUntilWarn);
    logoutTimerRef.current = window.setTimeout(() => {
      handleAutoLogout();
    }, props.timeUntilWarn + props.timeFromWarnToLogout);
  };

  useEffect(() => {
    hasLoggedOutRef.current = false;
    scheduleTimers();

    const handleActivity = (): void => {
      if (hasLoggedOutRef.current) return;
      onActive();
      scheduleTimers();
    };

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        handleActivity();
      }
    };

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'touchstart',
      'touchmove',
      'mousedown',
      'wheel',
      'scroll',
      'focus',
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { capture: true, passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimers();
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity, { capture: true } as EventListenerOptions);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [props.timeUntilWarn, props.timeFromWarnToLogout]);

  const onStillHere = (): void => {
    setShowModal(false);
    scheduleTimers();
  };

  return (
    <div data-testid="auto-logout">
      <IdleTimeOutModal showModal={showModal} handleClose={onStillHere} handleLogout={handleLogout} />
      <DeviceSleepDetect timeOut={props.timeBeforeConsideredSleep} handleAutoLogout={handleAutoLogout} />
    </div>
  );
}

export default AutoLogout;
