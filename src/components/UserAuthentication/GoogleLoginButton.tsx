import React, { useEffect } from 'react';

import getServerURL from '../../serverOverride';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const currentMode = import.meta.env.MODE;
const originUri = currentMode === 'production'
  ? 'https://keep.id'
  : currentMode === 'staging'
    ? 'https://staged.keep.id'
    : 'http://localhost:3000';

export default function GoogleLoginButton({ handleGoogleLoginSuccess, handleGoogleLoginError }) {
  useEffect(() => {
    const redirecting = sessionStorage.getItem('redirecting');
    const provider = sessionStorage.getItem('oauth_redirect_provider');
    if (redirecting === 'true' && (!provider || provider === 'google')) {
      sessionStorage.removeItem('redirecting');
      sessionStorage.removeItem('oauth_redirect_provider');
      handleGoogleLoginSuccess();
    }
  }, []);

  const handleClick = () => {
    fetch(`${getServerURL()}/googleLoginRequest`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        redirectUri: `${getServerURL()}/googleLoginResponse`,
        originUri,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'REQUEST_SUCCESS' && data.codeChallenge && data.state) {
          const codeChallenge = data.codeChallenge;
          const state = data.state;
          const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
          `client_id=${clientId}` +
          '&response_type=code' +
          '&scope=openid%20email%20profile' +
          `&redirect_uri=${getServerURL()}/googleLoginResponse` +
          `&state=${state}` +
          '&code_challenge_method=S256' +
          `&code_challenge=${codeChallenge}` +
          '&prompt=select_account';
          sessionStorage.setItem('redirecting', 'true');
          sessionStorage.setItem('oauth_redirect_provider', 'google');
          window.location.href = googleAuthUrl;
        } else if (data.status === 'INTERNAL_ERROR') {
          handleGoogleLoginError('Google sign-in is temporarily unavailable. Please use email/password to log in.');
        } else {
          handleGoogleLoginError('Could not initiate Google sign-in. Please try again.');
        }
      })
      .catch((_) => {
        handleGoogleLoginError('Network Error: Unable to reach the server. Please check your connection and try again.');
      });
  };

  return (
    <div
      onClick={handleClick}
      className="btn btn-outline-secondary mb-3 w-100 position-relative d-flex align-items-center
          justify-content-between"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        style={{ width: 20, height: 20 }}
        className="position-absolute start-3"
      />
      <span
        className="text-center flex-grow-1"
      >
          Sign in with Google
      </span>
    </div>
  );
}
