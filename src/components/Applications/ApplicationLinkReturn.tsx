import React, { useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';

import { APPLICATION_RETURN_KEY, pendingApplicationLink, rememberApplicationLink } from './applicationLinks';

export default function ApplicationLinkReturn({ authenticated, ready }: { authenticated: boolean; ready: boolean }) {
  const location = useLocation();
  const target = pendingApplicationLink();
  const current = location.pathname + location.search;
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) rememberApplicationLink();
    else if (target === current) sessionStorage.removeItem(APPLICATION_RETURN_KEY);
  }, [authenticated, ready, current, target]);
  return ready && authenticated && target && current !== target ? <Redirect to={target} /> : null;
}
