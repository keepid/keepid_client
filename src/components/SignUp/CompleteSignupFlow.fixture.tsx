import React from 'react';

import BaseSignupFixture from './BaseSignupFixture';
import CompleteSignupFlow, { CompleteSignupFlowV2 } from './CompleteSignupFlow';

const CompleteSignupFlowFixture = () => <BaseSignupFixture v1Component={<CompleteSignupFlow />} v2Component={<CompleteSignupFlowV2 />} />;

export default CompleteSignupFlowFixture;
