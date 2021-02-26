import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { MemoryRouter } from 'react-router-dom';

import { SignUserAgreement } from '../../../components/SignUp/pages/SignUserAgreement';

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

describe('Sign User Agreement Test', () => {
  const hasSigned = true;
  const canvasDataUrl = '';
  test('Successful setup', async () => {
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    window.HTMLCanvasElement.prototype.toDataURL = jest.fn();
    window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillStyle: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      scale: jest.fn(),
    }));
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
          <SignUserAgreement
            handleContinue={handleContinue}
            handlePrevious={handlePrevious}
            handleChangeSignEULA={jest.fn()}
            handleCanvasSign={jest.fn()}
            canvasDataUrl={canvasDataUrl}
            hasSigned={hasSigned}
            alert={{
              show: jest.fn(),
            }}
          />
        </Provider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
      expect(handlePrevious).toBeCalledTimes(1);
    });
  });
  test('Testing signature not signed', async () => {
    const hasSigned = false;
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();
    const alertShowFn = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    window.HTMLCanvasElement.prototype.toDataURL = jest.fn();
    window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillStyle: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      scale: jest.fn(),
    }));
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
          <SignUserAgreement
            handleContinue={handleContinue}
            handlePrevious={handlePrevious}
            handleChangeSignEULA={jest.fn()}
            handleCanvasSign={jest.fn()}
            canvasDataUrl={canvasDataUrl}
            hasSigned={hasSigned}
            alert={{
              show: alertShowFn,
            }}
          />
        </Provider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(0);
      expect(alertShowFn).toBeCalledTimes(1);
    });
    expect(alertShowFn).toBeCalledWith('Please sign the EULA');
  });
});
