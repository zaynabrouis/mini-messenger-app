/**
 * MessageInput Component
 * Input field and send button for sending chat messages
 * Handles message submission via Socket.io
 */

import { useState } from 'react';
import '../styles.css';

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  /**
   * Handle form submission
   * Sends message and clears input
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  /**
   * Handle Enter key press (submit) or Shift+Enter (new line)
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Connecting...' : 'Type a message...'}
        disabled={disabled}
        maxLength={1000}
      />
      <button 
        type="submit" 
        className="btn btn-send"
        disabled={disabled || !message.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;

