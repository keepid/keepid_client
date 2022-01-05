import React from 'react';

import BaseSignupFixture from '../BaseSignupFixture';
import ReviewSubmit from './ReviewSubmit';

const ReviewSubmitFixture = () => (
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

export default ReviewSubmitFixture;
