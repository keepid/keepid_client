import React from 'react';
import ReactDOM from 'react-dom';
import { transitions, Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import { NONAME } from 'dns';

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
    <App />
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
