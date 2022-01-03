import React from 'react';

import Role from '../../static/Role';
import BaseSignupFixture from './BaseSignupFixture';
import InviteSignupFlow, { InviteSignupFlowV2 } from './InviteSignupFlow';

const InviteSignupFlowFixture = () => <BaseSignupFixture v1Component={<InviteSignupFlow />} v2Component={<InviteSignupFlowV2 orgName="My Test Organization" personRole={Role.Client} />} />;

export default InviteSignupFlowFixture;
