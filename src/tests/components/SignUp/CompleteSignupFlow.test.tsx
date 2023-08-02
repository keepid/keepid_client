import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import CompleteSignupFlow from '../../../components/SignUp/CompleteSignupFlow';
import SignUpContext, {
  defaultSignUpContextValue,
} from '../../../components/SignUp/SignUp.context';

describe('Complete Signupflow Test', () => {
  test('Successful setup', async () => {
    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate}>
          <IntlProvider locale="en">
            <SignUpContext.Provider value={defaultSignUpContextValue}>
              <CompleteSignupFlow />
            </SignUpContext.Provider>
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
  });
});
