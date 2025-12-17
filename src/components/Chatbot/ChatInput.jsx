import React, { useState } from 'react';
import '@site/src/css/chatbot.css';

const ChatInput = ({ onSendMessage, sessionId }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Call parent component to handle the message
    if (onSendMessage) {
      await onSendMessage(inputValue);
    }

    setInputValue('');
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit} role="form">
      <input
        type="text"
        className="chat-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask a question about the book..."
        disabled={!sessionId}
        aria-label="Type your message"
        autoFocus
      />
      <button
        type="submit"
        className="send-button"
        disabled={!sessionId}
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;