import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from './AuthModal'; // <-- Relative import avoids path alias lookup issues

// Create mock functions
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();

// Mock the useAuth hook module
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

describe('[P1] AuthModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={mockOnClose} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the Sign In form by default when opened', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it('toggles to the Sign Up form when the switch button is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const switchButton = screen.getByRole('button', { name: /^sign up$/i });
    await user.click(switchButton);

    expect(
      screen.getByRole('heading', { name: /create an account/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^sign up$/i }),
    ).toBeInTheDocument();
  });

  it('calls signIn and onClose on valid form submission in Sign In mode', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', {
      name: /^sign in$/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays an error message if authentication fails', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', {
      name: /^sign in$/i,
    });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    const errorMessage = await screen.findByText(/invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
