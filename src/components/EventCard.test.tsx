import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EventCard, EventItem } from './EventCard';

// Mock event data
const mockEvent: EventItem = {
  id: 'evt-ticketmaster-999',
  name: 'Coldplay: Music of the Spheres World Tour',
  images: [
    { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745' },
  ],
  dates: {
    start: {
      localDate: '2026-11-20',
      localTime: '19:30:00',
    },
  },
  _embedded: {
    venues: [
      {
        name: 'Raymond James Stadium',
        city: { name: 'Tampa' },
        state: { name: 'Florida' },
      },
    ],
  },
  classifications: [
    {
      genre: { name: 'Rock' },
      segment: { name: 'Music' },
    },
  ],
};

describe('[P1] EventCard Component', () => {
  it('renders event name, date, genre, and venue details correctly', () => {
    render(<EventCard event={mockEvent} />);

    // Verify Event Name
    expect(
      screen.getByText('Coldplay: Music of the Spheres World Tour'),
    ).toBeInTheDocument();

    // Verify Date
    expect(screen.getByText(/2026-11-20/i)).toBeInTheDocument();

    // Verify Genre badge
    expect(screen.getByText('Rock')).toBeInTheDocument();

    // Verify Venue and City
    expect(screen.getByText(/raymond james stadium/i)).toBeInTheDocument();
    expect(screen.getByText(/tampa/i)).toBeInTheDocument();
  });

  it('renders the event image with correct attributes', () => {
    render(<EventCard event={mockEvent} />);
    const image = screen.getByRole('img', { name: /coldplay/i });
    expect(image).toBeInTheDocument();

    const imageUrl = mockEvent.images?.[0]?.url;
    expect(imageUrl).toBeDefined();
    expect(image.getAttribute('src')).toContain(encodeURIComponent(imageUrl!));
  });

  it('correctly sets the Next.js link href for event navigation', () => {
    render(<EventCard event={mockEvent} />);

    // Find the link wrapping the card
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/events/evt-ticketmaster-999');
  });

  it('handles missing optional data gracefully with fallback text', () => {
    const minimalEvent: EventItem = {
      id: 'evt-minimal-001',
      name: 'Local Showcase',
    };

    render(<EventCard event={minimalEvent} />);

    // Verify fallbacks render properly
    expect(screen.getByText('Local Showcase')).toBeInTheDocument();
    expect(screen.getByText(/date tba/i)).toBeInTheDocument();
    expect(screen.getByText(/venue tba/i)).toBeInTheDocument();
    expect(screen.getByText('Live Event')).toBeInTheDocument(); // Genre fallback
  });
});
