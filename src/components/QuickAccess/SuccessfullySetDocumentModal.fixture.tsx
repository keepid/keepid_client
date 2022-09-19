import React from 'react';
import { useSelect } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';

import { QuickAccessCategory } from './QuickAccess.util';
import SuccessfullySetDocumentModal from './SuccessfullySetDocumentModal';

function SuccessfullySetDocumentModalFixture() {
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
      <SuccessfullySetDocumentModal category={category as QuickAccessCategory} />
    </IntlProvider>
  );
}

export default SuccessfullySetDocumentModalFixture;
