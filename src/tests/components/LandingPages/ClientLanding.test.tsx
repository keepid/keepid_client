// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import ClientLanding from '../../../components/LandingPages/ClientLanding';
import getServerURL from '../../../serverOverride';

const fourDaysInMS = 4 * 24 * 60 * 60 * 1000;
const fourDaysAgoDate = new Date(+new Date() - fourDaysInMS);

const server = setupServer();
describe('Client Landing Page Tests', () => {
  const name = 'Test';
  const username = 'testOrg4';
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());
  describe('Successful Scenarios', () => {
    const successFetchActivities = {
      status: 'SUCCESS',
      activities: {
        allActivities: [
          {
            type: ['ChangeUserAttributesActivity'],
            info: [
              JSON.stringify({
                _id: { $oid: '604d4e4789690d4671992694' },
                owner: { username },
                occuredAt: { $date: +fourDaysAgoDate },
              }),
            ],
          },
        ],
      },
    };
    beforeEach(() => {
      server.use(
        rest.post(`${getServerURL()}/get-all-activities`, (req, res, ctx) => {
          const reqBody =
            typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
          if (reqBody.username === username) {
            return res(ctx.json(successFetchActivities));
          }
          return res();
        }),
      );
    });
    test('Succesfully renders', () => {
      render(
        <IntlProvider locale="en">a
          <MemoryRouter>
            <ClientLanding name={name} username={username} />
          </MemoryRouter>
        </IntlProvider>,
      );
      expect(
        screen.getByRole('heading', { name: /welcome/i }),
      ).toHaveTextContent(`Welcome, ${name}`);
    });
    test('Normal Activities Array', async () => {
      render(
        <IntlProvider locale="en">a
          <MemoryRouter>
            <ClientLanding name={name} username={username} />
          </MemoryRouter>
        </IntlProvider>,
      );
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/completed by/i)).toHaveTextContent(
          `Completed by ${username}, ${fourDaysAgoDate.toLocaleDateString()}, 4 days ago`,
        );
      });
    });
  });
  describe('Test Invalid Activities Response', () => {
    const successFetchActivities = {
      status: 'SUCCESS',
      activities: {
        allActivities: [],
      },
    };
    beforeEach(() => {
      server.use(
        rest.post(`${getServerURL()}/get-all-activities`, (req, res, ctx) => {
          const reqBody =
            typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
          if (reqBody.username === username) {
            return res(ctx.json(successFetchActivities));
          }
          return res();
        }),
      );
    });
    test('Empty Activities Array', async () => {
      render(
        <IntlProvider locale="en">a
          <MemoryRouter>
            <ClientLanding name={name} username={username} />
          </MemoryRouter>
        </IntlProvider>,
      );
      // Assert
      await waitFor(() => {
        expect(screen.getByText('No activities found!')).toBeInTheDocument();
      });
    });
  });
});
