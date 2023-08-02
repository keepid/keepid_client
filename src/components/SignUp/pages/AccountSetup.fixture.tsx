import React from 'react';

import BaseSignupFixture from '../BaseSignupFixture';
import AccountSetup from './AccountSetup';

export default function AccountSetupFixture() {
  return (
    <BaseSignupFixture>
      <AccountSetup />
    </BaseSignupFixture>
  );
}
