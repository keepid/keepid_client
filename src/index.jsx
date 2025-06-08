import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { IntlProvider } from 'react-intl';
import { createRoot } from 'react-dom/client';
import './static/styles/main.scss'
import 'bootstrap/dist/css/bootstrap.min.css';
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
const root = createRoot(document.getElementById('root'))
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
)