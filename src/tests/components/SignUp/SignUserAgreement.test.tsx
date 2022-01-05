import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import SignUserAgreement from '../../../components/SignUp/pages/SignUserAgreement';
import SignUpContext, {
  defaultSignUpContextValue,
} from '../../../components/SignUp/SignUp.context';

describe('Sign User Agreement Test', () => {
  beforeEach(() => {
    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    window.HTMLCanvasElement.prototype.toDataURL = jest.fn();
    // @ts-ignore
    window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillStyle: jest.fn(),
      fill: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      scale: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
    }));
  });
  test('Successful setup', async () => {
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
                moveToPreviousSignupStage: handlePrevious,
              },
            }}
          >
            <SignUserAgreement />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.mouseDown(screen.getByTestId('signature-canvas'), { which: 1 });
    fireEvent.mouseMove(screen.getByTestId('signature-canvas'));
    fireEvent.mouseUp(screen.getByTestId('signature-canvas'), { which: 1 });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
      expect(handlePrevious).toBeCalledTimes(1);
    });
  });
  test('Testing signature not signed', async () => {
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
                moveToPreviousSignupStage: handlePrevious,
              },
            }}
          >
            <SignUserAgreement />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Assert
    await new Promise((resolve) => setTimeout(resolve, 500));
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(0);
    });
  });
});
