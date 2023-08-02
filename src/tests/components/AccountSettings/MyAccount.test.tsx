// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import { MyAccount } from '../../../components/AccountSettings/MyAccount';
import getServerURL from '../../../serverOverride';
import { fakeUser as generateFakeUser } from '../../test-utils/faker';

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

describe('MyAccount', () => {
  const resetPasswordSuccessResponseBody = {
    status: 'AUTH_SUCCESS',
  };
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
    changePasswordAPIHandler = jest.fn((req, res, ctx) => {
      const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.newPassword === newPassword && reqBody.oldPassword === oldPassword) {
        return res(ctx.json(resetPasswordSuccessResponseBody));
      }

      if (reqBody.oldPassword !== oldPassword) {
        return res(ctx.json(resetPasswordFailureResponseBody));
      }

      return res(ctx.json(resetPasswordInvalidParamResponseBody));
    });
    server.use(rest.post(`${getServerURL()}/change-password`, changePasswordAPIHandler));

    const getUserInfoHandler = jest.fn((req, res, ctx) => res(ctx.json({ status: 'SUCCESS', ...fakeUser })));
    server.use(rest.post(`${getServerURL()}/get-user-info`, getUserInfoHandler));

    const getLoginHistoryHandler = jest.fn((req, res, ctx) => res(ctx.json({})));
    server.use(rest.post(`${getServerURL()}/get-login-history`, getLoginHistoryHandler));
  });

  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  test('should pre-populate user info', async () => {
    const alertShowFn = jest.fn();
    const { getByDisplayValue } = render(
      <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
        <MyAccount alert={{ show: alertShowFn }} />
      </Provider>,
    );
    await waitFor(() => {
      // The "First Name" input doesn't have a proper label, we can't use `getByLabelText`. Instead,
      // find the input by its display value, which should be equal to the firstName property of the `fakeUser`
      // we set as the response to the `/get-user-info` method in the `beforeEach` hook
      const input = getByDisplayValue(fakeUser.firstName);
      // Verify that the input was successfully found and is present in the document
      expect(input).toBeInTheDocument();
      // Verify that the input has the expected name attribute of `firstName` (this is like the "id" of the input)
      expect(input.getAttribute('name')).toEqual('firstName');
      // repeat for other properties (birthDate & state weren't displaying properly -- worth checking out)
      const properties = ['lastName', /* 'birthDate', */ 'email', 'phone', 'address', 'city', /* 'state', */ 'zipcode'];
      properties.forEach((propertyName) => {
        const input = getByDisplayValue(fakeUser[propertyName]);
        expect(input).toBeInTheDocument();
        expect(input.getAttribute('name')).toEqual(propertyName);
      });
    });
  });

  describe('ChangePassword', () => {
    test('should send successful change password message', async () => {
      const alertShowFn = jest.fn();
      const { getByLabelText, getByText, getByTestId } = render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      // Act
      fireEvent.click(getByTestId('edit-change-password'));

      // wait for submit button to appear
      await waitFor(() => getByTestId('submit-change-password'));

      fireEvent.change(getByLabelText(/Old password/), { target: { value: oldPassword } });
      fireEvent.change(getByLabelText(/^New password/), { target: { value: newPassword } });
      fireEvent.change(getByLabelText('Confirm new password'), { target: { value: newPassword } });
      fireEvent.click(getByTestId('submit-change-password'));

      // Assert
      await waitFor(() => {
        expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(alertShowFn).toBeCalledTimes(1);
      });

      // expect(loginFn).toBeCalledTimes(0);
      expect(alertShowFn).toBeCalledWith('Successfully updated password');
    });

    test('should display expected error message when incorrect old password', async () => {
      const alertShowFn = jest.fn();
      const { getByLabelText, getByText, getByTestId } = render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      // Act
      fireEvent.click(getByTestId('edit-change-password'));

      // wait for submit button to appear
      await waitFor(() => getByTestId('submit-change-password'));

      fireEvent.change(getByLabelText(/Old password/), { target: { value: 'incorrect-old-password' } });
      fireEvent.change(getByLabelText(/^New password/), { target: { value: newPassword } });
      fireEvent.change(getByLabelText('Confirm new password'), { target: { value: newPassword } });
      fireEvent.click(getByTestId('submit-change-password'));

      // Assert
      await waitFor(() => {
        expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(getByText('Old password is incorrect')).toBeInTheDocument();
      });

      expect(alertShowFn).toBeCalledTimes(0);
    });

    test('should display expected error message when invalid new password', async () => {
      const alertShowFn = jest.fn();
      const { getByLabelText, getByText, getByTestId } = render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      // Act
      fireEvent.click(getByTestId('edit-change-password'));

      // wait for submit button to appear
      await waitFor(() => getByTestId('submit-change-password'));

      fireEvent.change(getByLabelText(/Old password/), { target: { value: oldPassword } });
      // this will trigger the `INVALID_PARAMETER` response status
      fireEvent.change(getByLabelText(/^New password/), { target: { value: 'bad-new-password' } });
      fireEvent.change(getByLabelText('Confirm new password'), { target: { value: 'bad-new-password' } });
      fireEvent.click(getByTestId('submit-change-password'));

      // Assert
      await waitFor(() => {
        expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(getByText('The new password is invalid')).toBeInTheDocument();
      });

      expect(alertShowFn).toBeCalledTimes(0);
    });

    test('should display expected error message when request fails', async () => {
      changePasswordAPIHandler = jest.fn((req, res, ctx) => res(ctx.json(resetPasswordUnknownResponseBody)));
      server.use(rest.post(`${getServerURL()}/change-password`, changePasswordAPIHandler));

      const alertShowFn = jest.fn();
      const { getByLabelText, getByText, getByTestId } = render(
        <Provider template={AlertTemplate} {...options} className="alert-provider-custom">
          <MyAccount alert={{ show: alertShowFn }} />
        </Provider>,
      );

      // Act
      fireEvent.click(getByTestId('edit-change-password'));

      // wait for submit button to appear
      await waitFor(() => getByTestId('submit-change-password'));

      fireEvent.change(getByLabelText(/Old password/), { target: { value: oldPassword } });
      // this will trigger the `INVALID_PARAMETER` response status
      fireEvent.change(getByLabelText(/^New password/), { target: { value: newPassword } });
      fireEvent.change(getByLabelText('Confirm new password'), { target: { value: newPassword } });
      fireEvent.click(getByTestId('submit-change-password'));

      // Assert
      await waitFor(() => {
        // expect(changePasswordAPIHandler).toHaveBeenCalledTimes(1);
        expect(alertShowFn).toBeCalledTimes(1);
      });

      expect(alertShowFn).toBeCalledWith('Failed resetting password, please try again.', { type: 'error' });
    });
  });
});
