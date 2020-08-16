import React from 'react';
import ReactDOM from 'react-dom';
import App from '../../App';
import { transitions, Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import renderer from'react-test-renderer';

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

const Root = () => (
  <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
    <App />
  </Provider>
);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Root />, div);
  ReactDOM.unmountComponentAtNode(div);
});

