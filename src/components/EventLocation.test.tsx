import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import EventLocation from './EventLocation';

describe('[P1] EventLocation Component', () => {
  it('renders nothing if no venue, city, or state is provided', () => {
    const { container } = render(<EventLocation />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the formatted location string and icon correctly', () => {
    render(
      <EventLocation
        venueName="Raymond James Stadium"
        cityName="Tampa"
        stateName="Florida"
      />,
    );

    const button = screen.getByRole('button', {
      name: /view venue details for raymond james stadium, tampa, florida/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Raymond James Stadium, Tampa, Florida');
  });

  it('omits the icon when showIcon is false', () => {
    render(
      <EventLocation
        venueName="Amalie Arena"
        cityName="Tampa"
        showIcon={false}
      />,
    );

    expect(screen.queryByText('📍')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens the VenueModal when the location button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EventLocation
        venueName="MidFlorida Credit Union Amphitheatre"
        cityName="Tampa"
      />,
    );

    // Modal should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the location button
    const button = screen.getByRole('button');
    await user.click(button);

    // Verify modal appears using the dialog role
    const dialogModal = await screen.findByRole('dialog');
    expect(dialogModal).toBeInTheDocument();

    // Verify modal contains the venue location text
    expect(dialogModal).toHaveTextContent(
      /midflorida credit union amphitheatre, tampa/i,
    );
  });
});
