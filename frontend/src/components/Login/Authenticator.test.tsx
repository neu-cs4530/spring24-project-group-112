import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

// Mock firebase functions
jest.mock('firebase/compat/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { email: 'test@example.com' } })),
}));

describe('Login Component', () => {
  it('renders login form elements', () => {
    render(<Login />);
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const showButton = screen.getByText('Show');
    const loginButton = screen.getByText('Login');

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(showButton).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

it('handles input change correctly', () => {
    render(<Login />);
    const usernameInput: HTMLInputElement = screen.getByLabelText('Username');
    const passwordInput: HTMLInputElement = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
});

it('toggles password visibility', () => {
    render(<Login />);
    const passwordInput: HTMLInputElement = screen.getByLabelText('Password');
    const showButton = screen.getByText('Show');

    fireEvent.click(showButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(showButton);
    expect(passwordInput.type).toBe('password');
});

  it('calls signIn function on login button click', async () => {
    render(<Login />);
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByText('Login');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Login')).not.toBeInTheDocument();
    });
  });
});
