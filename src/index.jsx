import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { IntlProvider } from 'react-intl';
import { createRoot } from 'react-dom/client';

import reportWebVitals from './reportWebVitals';
import App from './App';

const options = {
  position: 'bottom left',
  timeout: 5000,
  offset: '10vh',
  type: 'info',
  transition: transitions.fade,
  containerStyle: {
    zIndex: 99999,
  },
};
const root = createRoot(document.getElementById('root'));
root.render(
  <Provider
    template={AlertTemplate}
    {...options}
    className="alert-provider-custom"
  >
    <IntlProvider locale="en" defaultLocale="en">
      <App />
    </IntlProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
