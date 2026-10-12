import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from './Header';

// Mock Firebase & Firestore
vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() =>
    Promise.resolve({ exists: () => false, data: () => ({}) }),
  ),
}));

// Mock context hooks
const mockSignOut = vi.fn();
const mockSetTheme = vi.fn();

let mockUser: { email: string; uid?: string } | null = null;
let mockTheme = 'dark';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
  }),
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

describe('[P1] Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockTheme = 'dark';
    localStorage.clear();
  });

  it('renders the brand title and main navigation categories', () => {
    render(<Header />);

    expect(screen.getByText(/ticketmaster/i)).toBeInTheDocument();
    expect(screen.getByText(/concerts/i)).toBeInTheDocument();
    expect(screen.getByText(/sports/i)).toBeInTheDocument();
    expect(screen.getByText(/arts & theater/i)).toBeInTheDocument();
  });

  it('renders the Sign In button when user is unauthenticated', () => {
    render(<Header />);

    const signInButton = screen.getByRole('button', { name: /^sign in$/i });
    expect(signInButton).toBeInTheDocument();
  });

  it('renders the user avatar with initials when authenticated', () => {
    mockUser = { email: 'james@example.com' };
    render(<Header />);

    // Target avatar button using its title attribute
    const avatarButton = screen.getByTitle('james@example.com');
    expect(avatarButton).toBeInTheDocument();
    expect(avatarButton).toHaveTextContent('J');
  });

  it('toggles the theme dropdown and updates theme when selected', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Click the theme toggle button (using title attribute)
    const themeButton = screen.getByTitle(/change theme/i);
    await user.click(themeButton);

    // Select Light theme
    const lightThemeOption = screen.getByRole('button', { name: /light/i });
    expect(lightThemeOption).toBeInTheDocument();

    await user.click(lightThemeOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('opens and closes the user profile dropdown when authenticated', async () => {
    mockUser = { email: 'developer@example.com' };
    const user = userEvent.setup();
    render(<Header />);

    // Open user menu using title attribute
    const avatarButton = screen.getByTitle('developer@example.com');
    await user.click(avatarButton);

    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getByText('developer@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument();

    // Click Sign Out
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('toggles the mobile menu drawer when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const mobileMenuButton = screen.getByTitle(/toggle menu/i);
    await user.click(mobileMenuButton);

    // Verify mobile navigation links appear
    const mobileConcertsLinks = screen.getAllByText(/concerts/i);
    expect(mobileConcertsLinks.length).toBeGreaterThan(1);
  });
});
