import React from 'react';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';

import QuickAccessRouter from './QuickAccess.router';
import QuickAccessCards from './QuickAccessCards';

const QuickAccessCardsFixture = () => (
  <MemoryRouter initialEntries={['/quick-access']}>
    <IntlProvider locale="en">
      <Provider template={AlertTemplate} className="alert-provider-custom">
        <Route path="/quick-access" exact>
          <div style={{ background: '#EEEEEE', padding: '1rem' }}>
            <QuickAccessCards />
          </div>
        </Route>
        <QuickAccessRouter />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

export default QuickAccessCardsFixture;
