import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from '@/app/search/page';

// Mock next/navigation hooks
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('[P0] Search Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();

    // Mock global fetch for events search endpoint
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            id: 'event-1',
            name: 'Coldplay: Music of the Spheres World Tour',
            url: '#',
            images: [{ url: 'https://example.com/coldplay.jpg' }],
            dates: {
              start: { localDate: '2026-09-10', localTime: '20:00:00' },
            },
            venues: [
              { name: 'Raymond James Stadium', city: 'Tampa', state: 'FL' },
            ],
            priceRanges: [{ min: 45, max: 250, currency: 'USD' }],
            classifications: [{ genre: { name: 'Rock' } }],
          },
        ],
      }),
    });
  });

  it('renders search inputs and fetches initial events on load', async () => {
    render(<SearchPage />);

    // Verify search inputs are present
    expect(
      screen.getByPlaceholderText(/e\.g\. taylor swift, nba, hamilton/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\. new york, los angeles/i),
    ).toBeInTheDocument();

    // Verify fetched event renders
    await waitFor(() => {
      expect(
        screen.getByText('Coldplay: Music of the Spheres World Tour'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/raymond james stadium — tampa, fl/i),
      ).toBeInTheDocument();
    });
  });

  it('updates search keyword input and triggers router push on submit', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const keywordInput = screen.getByPlaceholderText(
      /e\.g\. taylor swift, nba, hamilton/i,
    );
    await user.type(keywordInput, 'Coldplay');

    const searchButton = screen.getByRole('button', { name: /search events/i });
    await user.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('q=Coldplay'),
    );
  });

  it('filters events when a category pill is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const sportsCategoryButton = screen.getByRole('button', {
      name: /^sports$/i,
    });
    await user.click(sportsCategoryButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('category=Sports'),
    );
  });
});
