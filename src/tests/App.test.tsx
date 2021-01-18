import React from 'react';
import { render } from '@testing-library/react';
import { transitions, Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
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
      <App />
    </Provider>,
  );
});
