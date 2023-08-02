import { render } from '@testing-library/react';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { IntlProvider } from 'react-intl';

import App from '../App';

const options = {
  position: 'top right',
  timeout: 0,
  offset: '10vh',
  type: 'info',
  transition: transitions.fade,
  containerStyle: {
    zIndex: 99999,
  },
};

test('renders without crashing', () => {
  render(
    <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
      <IntlProvider locale="en" defaultLocale="en">
        <App />
      </IntlProvider>
    </Provider>,
  );
});
