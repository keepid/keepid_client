import React from 'react';
import { useParams } from 'react-router';
import { Redirect } from 'react-router-dom';
import InviteSignupFlow from './InviteSignupFlow';

const jwtDecode = require('jwt-decode');

function InviteSignupJWT() {
  const { jwt }: any = useParams();
  try {
    const decoded = jwtDecode(jwt);
    const currentTime = Date.now() / 1000;
    if (decoded.exp > currentTime) {
      return <InviteSignupFlow orgName={decoded.organization} personRole={decoded.role} />;
    }
  } catch (err) {
    return <Redirect to="/error" />;
  }
  return <Redirect to="/error" />;
}

export default InviteSignupJWT;
