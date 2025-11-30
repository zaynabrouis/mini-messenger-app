/**
 * RoomSelector Component Tests
 * Tests room selection and callback functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomSelector from '../RoomSelector';
import * as api from '../../api';

// Mock the API module
vi.mock('../../api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('RoomSelector', () => {
  const mockOnRoomChange = vi.fn();
  const mockOnCreateRoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders room selector component', () => {
    api.get.mockResolvedValue({
      success: true,
      rooms: [],
    });

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    expect(screen.getByTestId('rooms-header')).toBeInTheDocument();
  });

  it('calls onRoomChange callback when a room is selected', async () => {
    const user = userEvent.setup();

    const mockRooms = [
      { name: 'general', createdAt: new Date() },
      { name: 'random', createdAt: new Date() },
    ];

    api.get.mockResolvedValue({
      success: true,
      rooms: mockRooms,
    });

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    // Wait for rooms to load
    await waitFor(() => {
      expect(screen.getByText(/random/i)).toBeInTheDocument();
    });

    // Click on a different room
    const randomRoomButton = screen.getByText(/random/i).closest('button');
    await user.click(randomRoomButton);

    // Verify callback was called with correct room name
    expect(mockOnRoomChange).toHaveBeenCalledWith('random');
  });

  it('does not call callback when clicking the current room', async () => {
    const user = userEvent.setup();

    const mockRooms = [
      { name: 'general', createdAt: new Date() },
    ];

    api.get.mockResolvedValue({
      success: true,
      rooms: mockRooms,
    });

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    // Wait for rooms to load
    await waitFor(() => {
      expect(screen.getByText(/general/i)).toBeInTheDocument();
    });

    // Click on current room
    const generalRoomButton = screen.getByText(/general/i).closest('button');
    
    // The button should exist and be marked as active
    expect(generalRoomButton).toHaveClass('active');
    
    // Clicking the current room shouldn't trigger callback
    // (handleRoomSelect checks if roomName !== currentRoom)
    await user.click(generalRoomButton);
    
    // Verify callback was NOT called since it's the current room
    expect(mockOnRoomChange).not.toHaveBeenCalled();
  });

  it('displays list of available rooms', async () => {
    const mockRooms = [
      { name: 'general', createdAt: new Date() },
      { name: 'random', createdAt: new Date() },
      { name: 'tech', createdAt: new Date() },
    ];

    api.get.mockResolvedValue({
      success: true,
      rooms: mockRooms,
    });

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    // Wait for rooms to load
    await waitFor(() => {
      expect(screen.getByText(/general/i)).toBeInTheDocument();
      expect(screen.getByText(/random/i)).toBeInTheDocument();
      expect(screen.getByText(/tech/i)).toBeInTheDocument();
    });
  });

  it('highlights the current room as active', async () => {
    const mockRooms = [
      { name: 'general', createdAt: new Date() },
      { name: 'random', createdAt: new Date() },
    ];

    api.get.mockResolvedValue({
      success: true,
      rooms: mockRooms,
    });

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    // Wait for rooms to load
    await waitFor(() => {
      const generalButton = screen.getByText(/general/i).closest('button');
      expect(generalButton).toHaveClass('active');
    });
  });

  it('calls API to fetch rooms on mount', async () => {
    api.get.mockResolvedValue({
      success: true,
      rooms: [],
    });

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/rooms');
    });
  });

  it('handles API error when fetching rooms', async () => {
    api.get.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <RoomSelector
        currentRoom="general"
        onRoomChange={mockOnRoomChange}
        onCreateRoom={mockOnCreateRoom}
      />
    );

    // Component should handle error gracefully
    await waitFor(() => {
      // Error handling is internal, just verify component doesn't crash
      expect(screen.getByTestId('rooms-header')).toBeInTheDocument();
    });
  });
});

