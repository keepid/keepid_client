import {
  cleanup, fireEvent,
  render, screen,
} from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import ClientLanding from '../../../components/LandingPages/ClientLanding';
import getServerURL from '../../../serverOverride';

const server = setupServer();
describe('Client Landing Page Tests', () => {
  const successFetchActivities = {
    status: 'SUCCESS',
  };
  const name = 'Test';
  const username = 'testOrg4';
  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => server.use(
    rest.post(`${getServerURL()}/get-all-activities`, (req, res, ctx) => {
      const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.username === username) {
        return res(ctx.json(successFetchActivities));
      }
      return null;
    }),
  ));
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  test('Succesfully renders', () => {
    render(
      <MemoryRouter>
        <ClientLanding name={name} username={username} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByText(`Welcome, ${name}!`));
  });
});
