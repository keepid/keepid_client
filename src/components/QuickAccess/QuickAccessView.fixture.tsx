import React from 'react';
import { useSelect } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';

import { QuickAccessCategory } from './QuickAccess.util';
import QuickAccessView from './QuickAccessView';

function QuickAccessViewFixture() {
  const [category] = useSelect('social-security', {
    options: [
      'social-security',
      'drivers-license',
      'birth-certificate',
      'vaccine-card',
    ],
  });
  return (
    <IntlProvider locale="en">
      <QuickAccessView category={category as QuickAccessCategory} />
    </IntlProvider>
  );
}

export default QuickAccessViewFixture;
