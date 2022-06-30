// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import {
  fireEvent, render, waitFor,
} from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import React from 'react';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import ClientProfilePage from '../../../components/AccountSettings/ClientProfilePage';

fetchMock.enableMocks();

describe('ClientProfilePage', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('Upload Profile Photo', () => {
    test('should call backend to upload photo', async () => {
      // Arrange
      fetchMock.mockResponseOnce(JSON.stringify({ status: 'SUCCESS' }));

      const alertShowFn = jest.fn();
      const file = new File(['profile photo'], 'photo.png', { type: 'image/png' });
      const { getByTestId } = render(
                <Provider template={AlertTemplate} className="alert-provider-custom">
                    <ClientProfilePage alert={{ show: alertShowFn }} username="test" />
                </Provider>,
      );

      // Act
      fireEvent.click(getByTestId('edit-info'));
      await waitFor(() => getByTestId('select-photo'));
      fireEvent.click(getByTestId('select-photo'));
      const imageInput = getByTestId('photo-input');
      fireEvent.change(imageInput, { target: { files: [file] } });
      await waitFor(() => getByTestId('set-profile-photo'));
      fireEvent.click(getByTestId('set-profile-photo'));

      // Assert
      expect(fetchMock).toBeCalled();
    });
  });
});
