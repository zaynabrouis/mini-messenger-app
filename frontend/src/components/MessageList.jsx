/**
 * MessageList Component
 * Displays a list of chat messages
 * Shows username, message text, and timestamp
 */

import '../styles.css';

const MessageList = ({ messages, currentUser }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="message-list empty" data-testid="message-list">
        <p data-testid="no-messages">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  /**
   * Format timestamp for display
   * @param {string|Date} timestamp - Message timestamp
   * @returns {string} Formatted time string
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    // Show relative time for recent messages
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;

    // Show date for older messages
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="message-list" data-testid="message-list">
      {messages.map((message) => {
        const isOwnMessage = currentUser && message.username === currentUser.username;
        return (
          <div 
            key={message._id || message.ts} 
            className={`message-item ${isOwnMessage ? 'message-own' : ''}`}
          >
            <div className="message-header">
              <span className="message-username">{message.username}</span>
              <span className="message-time">{formatTime(message.ts)}</span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

