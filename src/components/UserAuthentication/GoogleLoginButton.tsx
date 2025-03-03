import { CredentialResponse, GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import React from 'react';

import { generateCodeChallenge, generateCodeVerifier, generateState } from '../../pkceUtils';

export const CLIENT_ID: string = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
export const REDIRECT_URI = 'http://localhost:3000/callback';

export default function GoogleLoginButton() {
  const handleLoginSuccess = async (res: CredentialResponse) => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    console.log(res);

    // Store code verifier and state in sessionStorage
    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state, // CSRF protection
      prompt: 'login', // Force re-authentication
    });

    // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => console.error('Login Failed')}
        text="signin_with"
        theme="outline"
        // prompt="login"
      />
  );
}
