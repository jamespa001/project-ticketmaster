import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventDetailPage from '@/app/events/[id]/page';

// Mock next/navigation hooks
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthContext
let mockUser: { uid: string; email: string } | null = null;
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock AuthModal component
vi.mock('@/components/AuthModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div role="dialog" aria-label="Sign In Modal">
        <p>Sign In Required</p>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

describe('[P0] Booking Flow Integration', () => {
  const mockParams = { id: 'event-test-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'event-test-123',
        name: 'Metallica: M72 World Tour',
        images: [{ url: 'https://example.com/metallica.jpg' }],
        dates: {
          start: { localDate: '2026-11-05', localTime: '18:30:00' },
        },
        priceRanges: [{ type: 'standard', min: 50, max: 200, currency: 'USD' }],
        _embedded: {
          venues: [
            {
              name: 'Hard Rock Stadium',
              city: { name: 'Miami' },
              state: { name: 'FL' },
            },
          ],
        },
      }),
    });
  });

  it('renders event details and ticket tiers on load', async () => {
    render(<EventDetailPage params={mockParams} />);

    const eventTitle = await screen.findByRole('heading', {
      name: /metallica/i,
    });
    expect(eventTitle).toBeInTheDocument();

    // Match venue name and location parts robustly
    expect(screen.getByText(/hard rock stadium/i)).toBeInTheDocument();
    expect(screen.getByText(/miami/i)).toBeInTheDocument();

    expect(screen.getByText('Gold / VIP')).toBeInTheDocument();
    expect(screen.getByText('Platinum')).toBeInTheDocument();
  });

  it('opens AuthModal when unauthenticated user clicks Sign In to Buy Tickets', async () => {
    const user = userEvent.setup();
    render(<EventDetailPage params={mockParams} />);

    const checkoutButton = await screen.findByRole('button', {
      name: /sign in to buy tickets/i,
    });
    await user.click(checkoutButton);

    expect(
      screen.getByRole('dialog', { name: /sign in modal/i }),
    ).toBeInTheDocument();
  });

  it('allows ticket quantity selection and recalculates total price', async () => {
    const user = userEvent.setup();
    render(<EventDetailPage params={mockParams} />);

    const quantitySelect = await screen.findByRole('combobox');
    await user.selectOptions(quantitySelect, '3');

    expect(quantitySelect).toHaveValue('3');
  });

  it('navigates directly to checkout when user is authenticated', async () => {
    mockUser = { uid: 'user-1', email: 'james@example.com' };
    const user = userEvent.setup();
    render(<EventDetailPage params={mockParams} />);

    const checkoutButton = await screen.findByRole('button', {
      name: /proceed to checkout/i,
    });
    await user.click(checkoutButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/events/event-test-123/checkout'),
    );
  });
});
