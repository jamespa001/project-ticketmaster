import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import VenueModal from './VenueModal';

describe('[P1] VenueModal Component', () => {
  const mockOnClose = vi.fn();
  const defaultLocation = 'Amalie Arena, Tampa, Florida';

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <VenueModal
        isOpen={false}
        onClose={mockOnClose}
        location={defaultLocation}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders venue modal content correctly when open with default fallback values', () => {
    render(
      <VenueModal
        isOpen={true}
        onClose={mockOnClose}
        location={defaultLocation}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(`📍 ${defaultLocation}`)).toBeInTheDocument();

    // Check fallback text sections
    expect(
      screen.getByText(/on-site parking is available/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/clear bags up to/i)).toBeInTheDocument();
    expect(
      screen.getByText(/doors typically open 1 hour prior/i),
    ).toBeInTheDocument();

    // Check Google Maps link
    const mapLink = screen.getByRole('link', { name: /open in google maps/i });
    expect(mapLink).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(defaultLocation)),
    );
  });

  it('renders custom venue details when provided', () => {
    const customVenue = {
      parkingDetail: 'VIP valet parking available at Gate C.',
      generalInfo: { generalRule: 'Small clutches only. No backpacks.' },
      boxOfficeInfo: { openHours: 'Doors open 2 hours before showtime.' },
    };

    render(
      <VenueModal
        isOpen={true}
        onClose={mockOnClose}
        location={defaultLocation}
        venue={customVenue}
      />,
    );

    expect(
      screen.getByText('VIP valet parking available at Gate C.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Small clutches only. No backpacks.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Doors open 2 hours before showtime.'),
    ).toBeInTheDocument();
  });

  it('calls onClose when the close (X) button or Close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VenueModal
        isOpen={true}
        onClose={mockOnClose}
        location={defaultLocation}
      />,
    );

    // Click footer Close button
    const footerCloseButton = screen.getByRole('button', { name: /^close$/i });
    await user.click(footerCloseButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Click header close (X) button
    const headerCloseButton = screen.getByRole('button', {
      name: /close modal/i,
    });
    await user.click(headerCloseButton);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
