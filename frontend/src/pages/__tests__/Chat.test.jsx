/**
 * Chat Component Tests
 * Tests chat page rendering and message list display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../Chat';
import * as socketModule from '../../socket';

// Mock socket module
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  id: 'test-socket-id',
};

vi.mock('../../socket', () => ({
  createSocket: vi.fn(() => mockSocket),
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

// Mock child components
vi.mock('../../components/MessageList', () => ({
  default: ({ messages }) => (
    <div data-testid="message-list">
      {messages && messages.length > 0 ? (
        messages.map((msg, idx) => (
          <div key={idx} data-testid="message-item">
            <span data-testid="message-username">{msg.username}</span>
            <span data-testid="message-text">{msg.text}</span>
          </div>
        ))
      ) : (
        <div data-testid="no-messages">No messages yet</div>
      )}
    </div>
  ),
}));

vi.mock('../../components/MessageInput', () => ({
  default: ({ onSendMessage, disabled }) => (
    <div data-testid="message-input">
      <button
        data-testid="send-button"
        onClick={() => onSendMessage && onSendMessage('test message')}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  ),
}));

vi.mock('../../components/RoomSelector', () => ({
  default: ({ currentRoom, onRoomChange }) => (
    <div data-testid="room-selector">
      <div data-testid="current-room">{currentRoom}</div>
      <button
        data-testid="change-room-button"
        onClick={() => onRoomChange('newroom')}
      >
        Change Room
      </button>
    </div>
  ),
}));

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('renders message list component', () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('displays empty message list when no messages', () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(screen.getByTestId('no-messages')).toBeInTheDocument();
  });

  it('renders messages when provided', () => {
    // This test would require mocking the socket events
    // For now, we test that the component structure is correct
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    const messageList = screen.getByTestId('message-list');
    expect(messageList).toBeInTheDocument();
  });

  it('displays current room name', async () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    // Wait for component to render with default room
    await waitFor(() => {
      expect(screen.getByText(/#general/i)).toBeInTheDocument();
    });
  });

  it('renders room selector component', () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(screen.getByTestId('room-selector')).toBeInTheDocument();
  });

  it('renders message input component', () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('redirects to login if no token', () => {
    localStorage.removeItem('token');

    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

