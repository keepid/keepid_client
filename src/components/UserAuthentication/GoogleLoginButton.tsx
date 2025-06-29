import React, { useEffect } from 'react';

import getServerURL from '../../serverOverride';

export default function GoogleLoginButton({ handleGoogleLoginSuccess, handleGoogleLoginError }) {
  useEffect(() => {
    const redirecting = sessionStorage.getItem('redirecting');
    if (redirecting === 'true') {
      sessionStorage.removeItem('redirecting');
      handleGoogleLoginSuccess();
    }
  }, []);

  const handleClick = () => {
    fetch(`${getServerURL()}/googleLoginRequest`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        redirectUri: `${getServerURL()}/googleLoginResponse`,
        originUri: process.env.NODE_ENV === 'production' ?
          'https://keep.id' : 'http://localhost:3000',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'REQUEST_SUCCESS' && data.codeChallenge && data.state) {
          const codeChallenge = data.codeChallenge;
          const state = data.state;
          const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
          `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}` +
          '&response_type=code' +
          '&scope=openid%20email%20profile' +
          `&redirect_uri=${getServerURL()}/googleLoginResponse` +
          `&state=${state}` +
          '&code_challenge_method=S256' +
          `&code_challenge=${codeChallenge}` +
          '&prompt=select_account';
          sessionStorage.setItem('redirecting', 'true');
          window.location.href = googleAuthUrl;
        } else {
          handleGoogleLoginError('Google Login Failed: Request Error.');
        }
      })
      .catch((_) => {
        handleGoogleLoginError('Network Error: Please Try Again.');
      });
  };

  return (
    <div
      onClick={handleClick}
      className="btn form-purple mb-3 w-100 position-relative d-flex align-items-center
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
