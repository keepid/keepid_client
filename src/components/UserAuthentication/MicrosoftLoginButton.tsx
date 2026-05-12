import React, { useEffect } from 'react';

import getServerURL from '../../serverOverride';

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'organizations';
const currentMode = import.meta.env.MODE;
const originUri = currentMode === 'production'
  ? 'https://keep.id'
  : currentMode === 'staging'
    ? 'https://staged.keep.id'
    : 'http://localhost:3000';

export default function MicrosoftLoginButton({ handleMicrosoftLoginSuccess, handleMicrosoftLoginError }) {
  useEffect(() => {
    const redirecting = sessionStorage.getItem('redirecting');
    const provider = sessionStorage.getItem('oauth_redirect_provider');
    if (redirecting === 'true' && provider === 'microsoft') {
      sessionStorage.removeItem('redirecting');
      sessionStorage.removeItem('oauth_redirect_provider');
      handleMicrosoftLoginSuccess();
    }
  }, []);

  const handleClick = () => {
    if (!clientId) {
      handleMicrosoftLoginError('Microsoft sign-in is unavailable. Missing VITE_MICROSOFT_CLIENT_ID.');
      return;
    }

    fetch(`${getServerURL()}/microsoftLoginRequest`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        redirectUri: `${getServerURL()}/microsoftLoginResponse`,
        originUri,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'REQUEST_SUCCESS' && data.codeChallenge && data.state) {
          const codeChallenge = data.codeChallenge;
          const state = data.state;
          const microsoftAuthUrl =
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
            `client_id=${clientId}` +
            '&response_type=code' +
            '&scope=openid%20email%20profile' +
            `&redirect_uri=${getServerURL()}/microsoftLoginResponse` +
            `&state=${state}` +
            '&code_challenge_method=S256' +
            `&code_challenge=${codeChallenge}` +
            '&prompt=select_account';
          sessionStorage.setItem('redirecting', 'true');
          sessionStorage.setItem('oauth_redirect_provider', 'microsoft');
          window.location.href = microsoftAuthUrl;
        } else if (data.status === 'INTERNAL_ERROR') {
          handleMicrosoftLoginError('Microsoft sign-in is temporarily unavailable. Please use email/password to log in.');
        } else {
          handleMicrosoftLoginError('Could not initiate Microsoft sign-in. Please try again.');
        }
      })
      .catch((_) => {
        handleMicrosoftLoginError('Network Error: Unable to reach the server. Please check your connection and try again.');
      });
  };

  return (
    <div
      onClick={handleClick}
      className="btn btn-outline-secondary mb-3 w-100 position-relative d-flex align-items-center
          justify-content-between"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
        alt="Microsoft"
        style={{ width: 20, height: 20 }}
        className="position-absolute start-3"
      />
      <span className="text-center flex-grow-1">
        Sign in with Microsoft
      </span>
    </div>
  );
}
