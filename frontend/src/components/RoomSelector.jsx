/**
 * RoomSelector Component
 * Allows users to switch between chat rooms
 * Fetches available rooms from API and displays them
 */

import { useState, useEffect } from 'react';
import { get, post } from '../api';
import '../styles.css';

const RoomSelector = ({ currentRoom, onRoomChange, onCreateRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  /**
   * Fetch available rooms from API
   */
  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await get('/rooms');
      if (response.success) {
        setRooms(response.rooms || []);
      } else {
        setError('Failed to load rooms');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load rooms on component mount
   */
  useEffect(() => {
    fetchRooms();
  }, []);

  /**
   * Handle room selection
   */
  const handleRoomSelect = (roomName) => {
    if (roomName !== currentRoom) {
      onRoomChange(roomName);
    }
  };

  /**
   * Handle create room form submission
   */
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await post('/rooms', { name: newRoomName.trim() });
      
      if (response.success) {
        // Refresh rooms list
        await fetchRooms();
        // Switch to new room
        onRoomChange(response.room.name);
        // Reset form
        setNewRoomName('');
        setShowCreateForm(false);
      } else {
        setError(response.message || 'Failed to create room');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-selector" data-testid="room-selector">
      <div className="room-selector-header">
        <h3 data-testid="rooms-header">Rooms</h3>
        <button
          className="btn btn-small"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-room-form" onSubmit={handleCreateRoom}>
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            maxLength={50}
            pattern="[a-zA-Z0-9_-]+"
            title="Only letters, numbers, hyphens, and underscores"
            required
          />
          <button type="submit" className="btn btn-small" disabled={loading}>
            Create
          </button>
        </form>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="room-list">
        {loading && rooms.length === 0 ? (
          <div className="loading">Loading rooms...</div>
        ) : (
          rooms.map((room) => (
            <button
              key={room.name}
              className={`room-item ${room.name === currentRoom ? 'active' : ''}`}
              onClick={() => handleRoomSelect(room.name)}
            >
              <span className="room-name">#{room.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomSelector;

