import React, { useEffect, useRef, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useHistory } from 'react-router-dom';

import DeviceSleepDetect from './DeviceSleepDetect';
import IdleTimeOutModal from './IdleTimeOutModal';

const timeUntilWarn: number = 1000 * 60 * 60; // 1 hour
const timeFromWarnToLogout: number = 1000 * 60 * 15; // 15 minutes
const timeout: number = timeUntilWarn + timeFromWarnToLogout;
const timeBeforeConsideredSleep: number = 1000 * 60 * 60 * 24 * 30; // 1 month

interface Props {
  logOut: () => void;
  setAutoLogout: (logout: boolean) => void;
}

function AutoLogout(props: Props): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  const handleLogout = (): void => {
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

  const onPrompt = (): void => {
    setShowModal(true);
  };

  const { activate } = useIdleTimer({
    name: 'IdleTimerWarn',
    events: ['mousemove', 'keydown', 'touchmove', 'mousedown', 'mousewheel'],
    throttle: 1000,
    eventsThrottle: 1000,
    element: document,
    onIdle: handleLogout, // will be called when the complete timeout expires
    onActive, // will be called when the idlestate switches to active
    onPrompt, // will be called when the timeUntilWarn time expires
    timeout,
    promptBeforeIdle: timeFromWarnToLogout,
    stopOnIdle: true,
  });

  const onStillHere = (): void => {
    setShowModal(false);
    activate();
  };

  return (
    <div data-testid="auto-logout">
      <IdleTimeOutModal showModal={showModal} handleClose={onStillHere} handleLogout={handleLogout} />
      <DeviceSleepDetect timeOut={timeBeforeConsideredSleep} handleAutoLogout={handleAutoLogout} />
    </div>
  );
}

export default AutoLogout;
