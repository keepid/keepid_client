import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import ClientLanding from '../../../components/LandingPages/ClientLanding';
import getServerURL from '../../../serverOverride';

vi.mock('../../../serverOverride', () => ({
  default: () => 'http://localhost:7001',
}));

const fourDaysInMS = 4 * 24 * 60 * 60 * 1000;
const fourDaysAgoDate = new Date(Date.now() - fourDaysInMS).toISOString();

const server = setupServer();

test('getServerURL returns localhost in test mode', () => {
  console.log('MODE:', import.meta.env.MODE);
  expect(getServerURL()).toBe('http://localhost:7001');
});

describe.skip('Client Landing Page Tests', () => {
  const name = 'Test';
  const username = 'testOrg4';

  beforeAll(() => server.listen());
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());

  describe('Successful Scenarios', () => {
    beforeEach(() => {
      server.use(
        rest.post('http://localhost:7001/get-all-activities', (req, res, ctx) => {
          const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
          if (body.username === username) {
            console.log('get-all-activities request body:', body);
            return res(
              ctx.status(200),
              ctx.json({
                status: 'SUCCESS',
                activities: [
                  {
                    type: 'ChangeUserAttributesActivity',
                    _id: '604d4e4789690d4671992694',
                    username,
                    occurredAt: fourDaysAgoDate,
                  },
                ],
              }),
            );
          }
          return res(ctx.status(200));
        }),
        rest.get(new RegExp('.*'), (req, res, ctx) => {
          console.warn(`🟡 Unhandled GET request to: ${req.url.href}`);
          return res(ctx.status(500), ctx.text('Unhandled GET request'));
        }),
        rest.post(new RegExp('.*'), (req, res, ctx) => {
          console.warn(`🟡 Unhandled POST request to: ${req.url.href}`);
          return res(ctx.status(500), ctx.text('Unhandled POST request'));
        }),
      );
    });

    test('Renders welcome message', () => {
      render(
        <IntlProvider locale="en">
          <MemoryRouter>
            <ClientLanding name={name} username={username} />
          </MemoryRouter>
        </IntlProvider>,
      );

      expect(screen.getByRole('heading', { name: /welcome/i })).toHaveTextContent(
        `Welcome, ${name}`,
      );
    });

    test('Displays normal activity', async () => {
      render(
        <IntlProvider locale="en">
          <MemoryRouter>
            <ClientLanding name={name} username={username} />
          </MemoryRouter>
        </IntlProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes('Completed by')),
        ).toBeInTheDocument();
        // expect(screen.getByText(/Completed by/)).toHaveTextContent(
        //   `Completed by ${username}, ${new Date(
        //     Date.parse(fourDaysAgoDate)
        //   ).toLocaleDateString()}, 4 days ago`
        // );
      });
    });
  });

  describe('Handles empty activities gracefully', () => {
    beforeEach(() => {
      server.use(
        rest.post('http://localhost:7001/get-all-activities', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json({
            status: 'SUCCESS',
            activities: [],
          }),
        )),
      );
    });

    test('Displays no activities message', async () => {
      render(
        <IntlProvider locale="en">
          <MemoryRouter>
            <ClientLanding name={name} username={username} />
          </MemoryRouter>
        </IntlProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('No activities found!')).toBeInTheDocument();
      });
    });
  });
});
