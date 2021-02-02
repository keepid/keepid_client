import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { UserType } from '../../types';
import { UserDetails } from './UserDetails';

const server = setupServer();

describe('InternalDashboard - UserDetails', () => {
  // beforeAll(() => {
  //   server.listen();
  // });
  // beforeEach(() =>
  //   server.use(
  //     rest.post(`${getServerURL()}/username-exists`, (req, res, ctx) => {
  //       const reqBody =
  //         typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  //       if (reqBody.username === username) {
  //         return res(ctx.json(validUsernameSuccess));
  //       }
  //       return res(ctx.json(invalidUsername));
  //     }),
  //   ));
  // afterEach(() => {
  //   cleanup();
  //   server.resetHandlers();
  // });
  // afterAll(() => server.close());

  test('should render user details', async () => {
    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    // @ts-ignore
    window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    const user = {
      firstName: 'test',
      lastName: 'user',
      birthDate: '2021-02-19',
      address: '1600 Pennsylvania Avenue',
      city: 'Philadelphia',
      state: 'PA',
      zipcode: '19106',
      phone: '(000)000-0000',
      email: 'testorg@gmail.com',
      username: 'testuser',
      twoFactorOn: false,
      organization: 'org',
      creationDate: new Date().toString(),
      privilegeLevel: UserType.CLIENT,
    };

    const { getByLabelText, getByText } = render(
      <UserDetails
        alert={{
          show: jest.fn(),
        }}
        user={user}
      />,
    );

    fireEvent.click(getByText('Edit Information'));

    await waitFor(() => {
      expect(getByLabelText('First Name').getAttribute('value')).toBe(
        user.firstName,
      );
    });
  });

  // test('Successful setup', async () => {
  //   const handleContinue = jest.fn();
  //
  //   global.window.matchMedia = jest.fn(() => ({
  //     addListener: jest.fn(),
  //     removeListener: jest.fn(),
  //   }));
  //   global.window.scrollTo = jest.fn();
  //   render(
  //     <MemoryRouter>
  //       <AccountSetup
  //         username={username}
  //         password={password}
  //         confirmPassword={password}
  //         onChangeUsername={jest.fn()}
  //         onChangePassword={jest.fn()}
  //         onChangeConfirmPassword={jest.fn()}
  //         handleContinue={handleContinue}
  //         alert={{
  //           show: jest.fn(),
  //         }}
  //         role={Role.LoggedOut}
  //       />
  //     </MemoryRouter>
  //   );
  //
  //   // Act
  //   fireEvent.change(screen.getByPlaceholderText('Username'), {
  //     target: { value: username },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText('Password'), {
  //     target: { value: password },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
  //     target: { value: password },
  //   });
  //   fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  //
  //   // Assert
  //   await waitFor(() => {
  //     expect(handleContinue).toBeCalledTimes(1);
  //   });
  // });
});
