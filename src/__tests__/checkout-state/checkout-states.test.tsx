import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckoutPage from '@/app/events/[id]/checkout/page';

// Mock next/navigation hooks
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'section') return 'VIP Balcony';
      if (key === 'price') return '100.00';
      if (key === 'qty') return '2';
      return null;
    },
  }),
}));

// Mock AuthContext
let mockUser: { uid: string; email: string } | null = null;
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

// Mock window.alert
window.alert = vi.fn();

describe('[P0] CheckoutPage Integration Tests', () => {
  const mockEventData = {
    id: 'event-test-123',
    name: 'Coldplay World Tour',
    dates: { start: { localDate: '2026-12-31', localTime: '20:00:00' } },
    _embedded: {
      venues: [
        {
          name: 'Wembley Stadium',
          city: { name: 'London' },
          state: { name: 'UK' },
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockEventData,
    });
  });

  it('renders loading/event details and price totals correctly', async () => {
    mockUser = { uid: 'user-1', email: 'james@example.com' };
    const mockParams = Promise.resolve({ id: 'event-test-123' });

    await act(async () => {
      render(<CheckoutPage params={mockParams} />);
    });

    const eventTitle = await screen.findByText(
      'Coldplay World Tour',
      {},
      { timeout: 4000 },
    );
    expect(eventTitle).toBeInTheDocument();

    expect(screen.getByText('VIP Balcony')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument(); // Subtotal (2 * $100)
    expect(screen.getByText('$235.00')).toBeInTheDocument(); // Grand total
  });

  it('adjusts quantity and recalculates totals correctly', async () => {
    mockUser = { uid: 'user-1', email: 'james@example.com' };
    const mockParams = Promise.resolve({ id: 'event-test-123' });
    const user = userEvent.setup();

    await act(async () => {
      render(<CheckoutPage params={mockParams} />);
    });

    await screen.findByText('Coldplay World Tour');

    const buttons = screen.getAllByRole('button');
    const plusButton = buttons.find((btn) => btn.textContent === '+');
    expect(plusButton).toBeDefined();

    if (plusButton) {
      await user.click(plusButton);
    }

    await waitFor(() => {
      expect(screen.getByText('$300.00')).toBeInTheDocument();
      expect(screen.getByText('$350.00')).toBeInTheDocument();
    });
  });

  it('blocks unauthenticated users with an alert when clicking checkout', async () => {
    mockUser = null;
    const mockParams = Promise.resolve({ id: 'event-test-123' });
    const user = userEvent.setup();

    await act(async () => {
      render(<CheckoutPage params={mockParams} />);
    });

    await screen.findByText('Coldplay World Tour');

    const checkoutButton = screen.getByText(/Proceed to Secure Payment/i);
    await user.click(checkoutButton);

    expect(window.alert).toHaveBeenCalledWith(
      'Please sign in to complete your order.',
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
