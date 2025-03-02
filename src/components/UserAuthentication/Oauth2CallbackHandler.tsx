import React, { useEffect } from 'react';

import getServerURL from '../../serverOverride';
// import axios from 'axios';

export default function CallbackHandler() {
  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const returnedState = urlParams.get('state');
      const storedState = sessionStorage.getItem('oauth_state');
      const codeVerifier = sessionStorage.getItem('code_verifier');

      console.log({ code, returnedState, storedState, codeVerifier });

      if (!code || !codeVerifier || !returnedState) {
        console.error('Missing code, code verifier, or state.');
        return;
      }

      if (returnedState !== storedState) {
        console.error('CSRF detected: State mismatch.');
        return;
      }

      try {
        const response = await fetch(`${getServerURL()}/auth/google-authentication`, {
          code,
          method: 'POST',
          code_verifier: codeVerifier,
          state: returnedState,
          redirect_uri: `${window.location.origin}/callback`,
        });

        console.log('User authenticated:', response.data); // Contains user info
      } catch (error) {
        console.error('Token exchange failed:', error);
      }
    };

    exchangeCodeForToken();
  }, []);

  return (
    <div>
      Authenticating with Google...
    </div>
  );
}
