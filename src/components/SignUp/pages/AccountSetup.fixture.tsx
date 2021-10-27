import { rest, setupWorker } from 'msw';
import React, { useEffect, useState } from 'react';
import { Provider, transitions, useAlert } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { Form } from 'react-bootstrap';
import { useValue } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';

import getServerURL from '../../../serverOverride';
import AccountSetup from './AccountSetup';

interface BaseInputFixtureProps {
  fixture: (props: any) => JSX.Element;
  type: string;
  otherProps?: object | undefined;
}

let mockServerIsSetup = false;
const validUsernameSuccess = {
  status: 'SUCCESS',
};
const invalidUsername = {
  status: 'USERNAME_ALREADY_EXISTS',
};

function setupMockServer() {
  console.log(`adfasdf ${getServerURL()}/username-exists`);
  const worker = setupWorker();
  worker.use(
    rest.post(`${getServerURL()}/username-exists`, (req, res, ctx) => {
      const reqBody =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.username === 'invalid') {
        return res(ctx.json(invalidUsername));
      }

      return res(ctx.json(validUsernameSuccess));
    }),
  );

  worker.start({ waitUntilReady: true });
}

const AccountSetupFixture = () => {
  useEffect(() => {
    if (!mockServerIsSetup) {
      setupMockServer();
      mockServerIsSetup = true;
    }
  });

  const [username, setUsername] = useValue<string>('Username', {
    defaultValue: '',
  });
  const [password, setPassword] = useValue<string>('Password', {
    defaultValue: '',
  });

  const [confirmPassword, setConfirmPassword] = useValue<string>(
    'Confirm Password',
    {
      defaultValue: '',
    },
  );

  const accountInfo = {
    username,
    password,
    confirmPassword,
  };

  return (
    <IntlProvider locale="en">
      <Provider template={AlertTemplate} className="alert-provider-custom">
        <AccountSetup
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onChangeUsername={(e) => setUsername(e.target.value)}
          onChangePassword={(e) => setPassword(e.target.value)}
          onChangeConfirmPassword={(e) => setConfirmPassword(e.target.value)}
          handleContinue={() => {
            console.log(accountInfo);
          }}
          handlePrevious={() => {}}
        />
      </Provider>
    </IntlProvider>
  );
};

export default AccountSetupFixture;
