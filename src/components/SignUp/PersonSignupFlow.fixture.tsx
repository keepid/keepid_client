import React from 'react';

import BaseSignupFixture from './BaseSignupFixture';
import PersonSignupFlow from './PersonSignupFlow';

export default function PersonSignupFlowFixture() {
  return (
    <BaseSignupFixture>
      <PersonSignupFlow />
    </BaseSignupFixture>
  );
}
