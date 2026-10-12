import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock Firebase auth to avoid real network calls
vi.mock('@/lib/firebase', () => ({
  auth: {},
}));

let mockFirebaseUser: any = null;
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth: any, callback: (user: any) => void) => {
    callback(mockFirebaseUser);
    return vi.fn(); // unsubscribe
  },
  GoogleAuthProvider: vi.fn(),
}));

// A test component modeling your authentication gate behavior
const ProtectedActionComponent = () => {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  if (loading) {
    return <div>Loading auth...</div>;
  }

  return (
    <div>
      <button
        data-testid="protected-btn"
        onClick={() => {
          if (!user) {
            setShowModal(true);
            return;
          }
        }}
      >
        Protected Action
      </button>
      {showModal && <div data-testid="auth-modal">Sign In Required</div>}
      {user && <div data-testid="welcome-msg">Welcome {user.email}</div>}
    </div>
  );
};

describe('[P0] Authentication Gate Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFirebaseUser = null;
  });

  it('blocks unauthenticated users and prompts auth modal/gate', async () => {
    mockFirebaseUser = null;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <ProtectedActionComponent />
      </AuthProvider>,
    );

    const protectedBtn = screen.getByTestId('protected-btn');
    await user.click(protectedBtn);

    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('[P0] allows authenticated users through without showing auth modal', async () => {
    mockFirebaseUser = { uid: '123', email: 'james@example.com' };
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <ProtectedActionComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('welcome-msg')).toHaveTextContent(
      'Welcome james@example.com',
    );

    const protectedBtn = screen.getByTestId('protected-btn');
    await user.click(protectedBtn);

    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });
});
