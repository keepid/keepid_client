import React from 'react';

import Role from '../../static/Role';
import BaseSignupFixture from './BaseSignupFixture';
import PersonSignupFlow, { PersonSignupFlowV2 } from './PersonSignupFlow';

const PersonSignupFlowFixture = () => <BaseSignupFixture v1Component={<PersonSignupFlow />} v2Component={<PersonSignupFlowV2 personRole={Role.Client} />} />;

export default PersonSignupFlowFixture;
