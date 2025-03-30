import { CredentialResponse, GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import React from 'react';

import getServerURL from '../../serverOverride';

export default function GoogleLoginButton({ handleGoogleLoginSuccess }) {
  return (
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => console.error('Login Failed')}
        text="signin_with"
        theme="outline"
      />
  );
}
