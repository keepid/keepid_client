import React from 'react';
import ReactDOM from 'react-dom';
import { InputGroup } from 'react-bootstrap';
import Header from '../../components/Header';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Header />, div);
});
