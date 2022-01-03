import React from 'react';
import { useValue } from 'react-cosmos/fixture';

import BaseSignupFixture from '../BaseSignupFixture';
import AccountSetup, { AccountSetupV2 } from './AccountSetup';

const AccountSetupV2Fixture = () => {
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
  return (
    <BaseSignupFixture
      v1Component={(
        <AccountSetup
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onChangeUsername={(e) => setUsername(e.target.value)}
          onChangePassword={(e) => setPassword(e.target.value)}
          onChangeConfirmPassword={(e) => setConfirmPassword(e.target.value)}
          handleContinue={() => console.log('next')}
          handlePrevious={() => console.log('previous')}
        />
      )}
      v2Component={<AccountSetupV2 />}
    />
  );
};

export default AccountSetupV2Fixture;
