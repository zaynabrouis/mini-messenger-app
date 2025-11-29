/**
 * Login Component Tests
 * Tests login form submission and API interaction
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import * as api from '../../api';

// Mock the API module
vi.mock('../../api', () => ({
  post: vi.fn(),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with username and password fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls API when login button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    api.post.mockResolvedValue({
      success: true,
      token: 'test-jwt-token',
      user: { id: '1', username: 'testuser' },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill in form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('saves token to localStorage and navigates on successful login', async () => {
    const user = userEvent.setup();
    const mockToken = 'test-jwt-token';

    // Mock successful API response
    api.post.mockResolvedValue({
      success: true,
      token: mockToken,
      user: { id: '1', username: 'testuser' },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill in and submit form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for navigation
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();

    // Mock failed API response
    api.post.mockResolvedValue({
      success: false,
      message: 'Invalid username or password',
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill in and submit form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });

    // Should not navigate or save token
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays loading state while submitting', async () => {
    const user = userEvent.setup();

    // Mock delayed API response
    api.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        success: true,
        token: 'test-token',
      }), 100))
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill in and submit form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check loading state
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
});

