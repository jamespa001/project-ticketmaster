import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global default fetch mock for JSDOM environment
const defaultFetchMock = vi.fn().mockImplementation((url) => {
  if (url.toString().includes('/api/events/')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        id: 'event-test-123',
        name: 'Metallica: M72 World Tour',
        images: [{ url: 'https://example.com/metallica.jpg' }],
        dates: { start: { localDate: '2026-11-05', localTime: '18:30:00' } },
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
  }
  return Promise.reject(new Error(`Unhandled fetch call to: ${url}`));
});

global.fetch = defaultFetchMock as any;
window.fetch = defaultFetchMock as any;
