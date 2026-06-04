import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InspiredPortfolioRoute } from './InspiredPortfolioRoute';

const duckDebugTips = [
  'Have you tried console.log()?',
  'Did you clear the cache?',
  'It works on my machine!',
  'Maybe it is a CSS issue?',
  'Check the error message first.',
  'Works in production!',
];

describe('InspiredPortfolioRoute', () => {
  it('reveals a waving greeting when the visitor hovers the window', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.mouseEnter(
      screen.getByRole('button', {
        name: /look through the window/i,
      }),
    );

    expect(screen.getByText(/danish waves from the window/i)).toBeInTheDocument();
  });

  it('shows a debug speech bubble when the duck pot is tapped', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /ask the duck for a debug tip/i,
      }),
    );

    expect(
      duckDebugTips.some((tip) => screen.queryByText(tip) !== null),
    ).toBeTruthy();
  });

  it('lets the visitor squash the bug and unlock the bug fixed achievement', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /squash the bug/i,
      }),
    );

    expect(screen.getAllByText(/bug fixed/i)[0]).toBeInTheDocument();
  });

  it('transitions from the entrance scene into the explorable corridor', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /enter the corridor/i,
      }),
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /explore the corridor/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /open tech dorm/i,
      }),
    ).toBeInTheDocument();
  });

  it('opens the tech dorm interior from the corridor and shows project signals', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /enter the corridor/i,
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /open tech dorm/i,
      }),
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /tech dorm/i,
      }),
    ).toBeInTheDocument();

    const techDormHeading = screen.getByRole('heading', {
      level: 2,
      name: /tech dorm/i,
    });
    const techDormPanel = techDormHeading.closest('section');

    expect(techDormPanel).not.toBeNull();
    expect(within(techDormPanel as HTMLElement).getByText(/featured builds/i)).toBeInTheDocument();
    expect(within(techDormPanel as HTMLElement).getAllByText(/omni-agent/i)[0]).toBeInTheDocument();
  });

  it('opens the corridor map and lets the visitor jump into Tech Dorm details', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /open route map/i,
      }),
    );

    const mapDialog = screen.getByRole('dialog', { name: /corridor map/i });
    expect(mapDialog).toBeInTheDocument();

    fireEvent.click(
      within(mapDialog).getByRole('button', {
        name: /tech dorm/i,
      }),
    );

    const techDormHeading = screen.getByRole('heading', {
      level: 2,
      name: /tech dorm/i,
    });
    const techDormPanel = techDormHeading.closest('section');

    expect(techDormHeading).toBeInTheDocument();
    expect(techDormPanel).not.toBeNull();
    expect(within(techDormPanel as HTMLElement).getAllByText(/omni-agent/i)[0]).toBeInTheDocument();
  });

  it('opens the music studio panel from the quick action controls', () => {
    render(<InspiredPortfolioRoute />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /open music studio/i,
      }),
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /music studio/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/sangeet visharad/i)[0]).toBeInTheDocument();
  });
});
