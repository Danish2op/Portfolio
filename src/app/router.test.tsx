import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { routes } from './router';

describe('app routing smoke test', () => {
  it('renders the corridor landing page on / and the admin shell on /admin', async () => {
    const rootRouter = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });

    const adminRouter = createMemoryRouter(routes, {
      initialEntries: ['/admin'],
    });

    const { unmount } = render(<RouterProvider router={rootRouter} />);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /welcome to danish sharma's digital universe/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /open route map/i,
      }),
    ).toBeInTheDocument();

    unmount();

    render(<RouterProvider router={adminRouter} />);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /admin control room/i,
      }),
    ).toBeInTheDocument();
  });
});
