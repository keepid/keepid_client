import React from 'react';

import BaseSignupFixture from '../BaseSignupFixture';
import ReviewSubmit from './ReviewSubmit';

export default function ReviewSubmitFixture() {
  return (
    <BaseSignupFixture>
      <ReviewSubmit
        onSubmit={(val) => {
          // eslint-disable-next-line no-console
          console.log(val);
          return Promise.resolve();
        }}
      />
    </BaseSignupFixture>
  );
}
