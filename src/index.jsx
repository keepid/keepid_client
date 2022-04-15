import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import App from './App';
import * as serviceWorker from './serviceWorker';

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

const Root = () => (
  <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
    <IntlProvider locale="en" defaultLocale="en">
      <App />
    </IntlProvider>
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
