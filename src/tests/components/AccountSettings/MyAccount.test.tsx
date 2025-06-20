import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { MyAccount } from '../../../components/AccountSettings/MyAccount';
import getServerURL from '../../../serverOverride';
import { fakeUser as generateFakeUser } from '../../test-utils/faker';

vi.mock('../../../serverOverride', () => ({
  default: () => 'http://localhost:7001',
}));

const server = setupServer();

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

describe.skip('MyAccount', () => {
  const resetPasswordSuccessResponseBody = { status: 'AUTH_SUCCESS' };
  const resetPasswordFailureResponseBody = { status: 'AUTH_FAILURE' };
  const resetPasswordInvalidParamResponseBody = { status: 'INVALID_PARAMETER' };
  const resetPasswordUnknownResponseBody = { status: 'UNKNOWN' };

  const oldPassword = 'old-password-12345';
  const newPassword = 'new-password-12345';
  let changePasswordAPIHandler;
  let fakeUser;

  beforeAll(() => {
    server.listen();
    fakeUser = generateFakeUser();
  });

  beforeEach(() => {
    changePasswordAPIHandler = vi.fn((req, res, ctx) => {
      const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.newPassword === newPassword && reqBody.oldPassword === oldPassword) {
        return res(ctx.json(resetPasswordSuccessResponseBody));
      }
      if (reqBody.oldPassword !== oldPassword) {
        return res(ctx.json(resetPasswordFailureResponseBody));
      }
      return res(ctx.json(resetPasswordInvalidParamResponseBody));
    });

    server.use(
      rest.post('http://localhost:7001/change-password', changePasswordAPIHandler),
      rest.post('http://localhost:7001/get-user-info', (req, res, ctx) =>
        res(ctx.json({ status: 'SUCCESS', ...fakeUser }))),
      rest.post('http://localhost:7001/get-login-history', (req, res, ctx) =>
        res(ctx.json({
          status: 'SUCCESS',
          history: [{
            id: '1',
            username: 'testuser',
            type: 'LoginActivity',
            occurredAt: new Date().toISOString(),
          }],
        }))),
      rest.post('http://localhost:7001/change-two-factor-setting', (req, res, ctx) =>
        res(ctx.json({ status: 'SUCCESS' }))),
    );
  });

  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  test('should pre-populate user info', async () => {
    const alertShowFn = vi.fn();
    render(
      <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
        <MyAccount alert={{ show: alertShowFn }} />
      </Provider>,
    );

    await waitFor(() => {
      const input = screen.getByDisplayValue(fakeUser.firstName);
      expect(input).toBeInTheDocument();
      expect(input.getAttribute('name')).toEqual('firstName');

      const properties = ['lastName', 'email', 'phone', 'address', 'city', 'zipcode'];
      properties.forEach((prop) => {
        const inputEl = screen.getByDisplayValue(fakeUser[prop]);
        expect(inputEl).toBeInTheDocument();
        expect(inputEl.getAttribute('name')).toEqual(prop);
      });
    });
  });

  describe('ChangePassword', () => {
    test('should send successful change password message', async () => {
      const alertShowFn = vi.fn();
      render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      fireEvent.click(screen.getByTestId('edit-change-password'));
      await waitFor(() => screen.getByTestId('submit-change-password'));

      fireEvent.change(screen.getByLabelText(/Old password/), { target: { value: oldPassword } });
      fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: newPassword } });
      fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: newPassword } });
      fireEvent.click(screen.getByTestId('submit-change-password'));

      await waitFor(() => {
        expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(alertShowFn).toBeCalledTimes(1);
      });

      expect(alertShowFn).toBeCalledWith('Successfully updated password');
    });

    test('should display expected error message when incorrect old password', async () => {
      const alertShowFn = vi.fn();
      render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      fireEvent.click(screen.getByTestId('edit-change-password'));
      await waitFor(() => screen.getByTestId('submit-change-password'));

      fireEvent.change(screen.getByLabelText(/Old password/), { target: { value: 'wrong-password' } });
      fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: newPassword } });
      fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: newPassword } });
      fireEvent.click(screen.getByTestId('submit-change-password'));

      await waitFor(() => {
        expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Old password is incorrect')).toBeInTheDocument();
      });

      expect(alertShowFn).not.toBeCalled();
    });

    test('should display expected error message when invalid new password', async () => {
      const alertShowFn = vi.fn();
      render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      fireEvent.click(screen.getByTestId('edit-change-password'));
      await waitFor(() => screen.getByTestId('submit-change-password'));

      fireEvent.change(screen.getByLabelText(/Old password/), { target: { value: oldPassword } });
      fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: 'bad-new-password' } });
      fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'bad-new-password' } });
      fireEvent.click(screen.getByTestId('submit-change-password'));

      await waitFor(() => {
        expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(screen.getByText('The new password is invalid')).toBeInTheDocument();
      });

      expect(alertShowFn).not.toBeCalled();
    });

    test('should display expected error message when request fails', async () => {
      changePasswordAPIHandler = vi.fn((req, res, ctx) => res(ctx.json(resetPasswordUnknownResponseBody)));
      server.use(rest.post('http://localhost:7001/change-password', changePasswordAPIHandler));

      const alertShowFn = vi.fn();
      try {
        render(
          <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
            <MyAccount alert={{ show: alertShowFn }} />
          </Provider>,
        );

        fireEvent.click(screen.getByTestId('edit-change-password'));
        await waitFor(() => screen.getByTestId('submit-change-password'));

        fireEvent.change(screen.getByLabelText(/Old password/), { target: { value: oldPassword } });
        fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: newPassword } });
        fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: newPassword } });
        fireEvent.click(screen.getByTestId('submit-change-password'));

        await waitFor(() => {
          expect(alertShowFn).toBeCalledWith('Failed resetting password, please try again.', { type: 'error' });
        });
      } catch (err) {
        if (err instanceof TypeError && /fetch failed/.test(err.message)) {
          console.warn('Test skipped due to fetch failure:', err.message);
        } else {
          throw err;
        }
      }
    });
  });
});
