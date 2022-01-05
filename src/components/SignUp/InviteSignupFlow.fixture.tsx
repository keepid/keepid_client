import React from 'react';

import Role from '../../static/Role';
import BaseSignupFixture from './BaseSignupFixture';
import InviteSignupFlow from './InviteSignupFlow';

const InviteSignupFlowFixture = () => (
  <BaseSignupFixture>
    <InviteSignupFlow orgName="My Test Organization" personRole={Role.Client} />
  </BaseSignupFixture>
);

export default InviteSignupFlowFixture;
