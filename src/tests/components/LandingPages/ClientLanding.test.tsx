import {
  cleanup, fireEvent,
  render, screen, waitFor,
} from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import ClientLanding from '../../../components/LandingPages/ClientLanding';
import getServerURL from '../../../serverOverride';

const server = setupServer();
describe('Client Landing Page Tests', () => {
  const name = 'Test';
  const username = 'testOrg4';
  const successFetchActivities = {
    status: 'SUCCESS',
    activities: {
      allActivities: [{ type: ['ChangeUserAttributesActivity'], info: [JSON.stringify({ _id: { $oid: '604d4e4789690d4671992694' }, owner: { username }, occuredAt: { $date: 1615661047721 } })] }],
    },
  };
  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    server.use(
      rest.post(`${getServerURL()}/get-all-activities`, (req, res, ctx) => {
        const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (reqBody.username === username) {
          return res(ctx.json(successFetchActivities));
        }
        return null;
      }),
    );
  });
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());
  test('Succesfully renders', () => {
    render(
      <MemoryRouter>
        <ClientLanding name={name} username={username} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByText(`Welcome, ${name}!`));
  });
  test('Activity Card Render', async () => {
    render(
      <MemoryRouter>
        <ClientLanding name={name} username={username} />
      </MemoryRouter>,
    );
    // Assert
    await waitFor(() => {
      fireEvent.change(screen.getByText('ChangeUserAttributes Activity'));
    });
  });
});

describe('Client Failed Tests', () => {
  const name = 'Test';
  const username = 'testOrg4';
  const successFetchActivities = {
    status: 'SUCCESS',
    activities: {
      allActivities: [],
    },
  };
  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    server.use(
      rest.post(`${getServerURL()}/get-all-activities`, (req, res, ctx) => {
        const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (reqBody.username === username) {
          return res(ctx.json(successFetchActivities));
        }
        return null;
      }),
    );
  });
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());
  test('Empty Activities Array', async () => {
    render(
      <MemoryRouter>
        <ClientLanding name={name} username={username} />
      </MemoryRouter>,
    );
    // Assert
    await waitFor(() => {
      fireEvent.change(screen.getByText('No activities found!'));
    });
  });
});
