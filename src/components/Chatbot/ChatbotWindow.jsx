import React, { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import '@site/src/css/chatbot.css';

const ChatbotWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your book assistant. How can I help you today?", sender: 'bot', sources: [] }
  ]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize chat session when component mounts
  useEffect(() => {
    const initSession = async () => {
      try {
        // Determine the API base URL based on environment
        const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8000'
          : '/api'; // For production, assumes proxy at /api path

        const response = await fetch(`${apiBaseUrl}/chat/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSessionId(data.sessionId);
      } catch (error) {
        console.error('Error initializing chat session:', error);
        // Add a message to inform the user about the connection issue
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "⚠️ Unable to connect to the chat service. Some features may be limited. Please check if the backend service is running.",
          sender: 'bot',
          sources: []
        }]);
        // Set a temporary session ID to allow the user to see the chat interface
        setSessionId('temp-' + Date.now());
      }
    };

    initSession();
  }, []);

  const handleSendMessage = async (messageText) => {
    // Check if using a temporary session ID (indicates connection issue)
    if (sessionId && sessionId.startsWith('temp-')) {
      // Add error message to inform user that messages can't be processed
      const errorMessage = {
        id: Date.now() + 1,
        text: "Unable to process your message because the chat service is not available. Please try again later when the service is restored.",
        sender: 'bot',
        sources: []
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (!sessionId || isLoading) return;

    // Add user message to the chat
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      sources: []
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Determine the API base URL based on environment
      const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000'
        : '/api'; // For production, assumes proxy at /api path

      // Send the message to the backend
      const response = await fetch(`${apiBaseUrl}/chat/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: sessionId,
          includeSources: true
        }),
      });

      const data = await response.json();

      // Add bot response to the chat
      const botMessage = {
        id: Date.now() + 1,
        text: data.message,
        sender: 'bot',
        sources: data.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to the chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: 'bot',
        sources: []
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-window" role="dialog" aria-label="Book Assistant Chat">
      <div className="chatbot-header" role="banner">
        <h3>Book Assistant</h3>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close chat"
          title="Close chat"
        >
          ×
        </button>
      </div>
      <div
        className="chatbot-messages"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sender={message.sender}
            sources={message.sources}
            isError={message.text.includes("Sorry, I encountered an error") ||
                     message.text.includes("couldn't find any relevant information")}
          />
        ))}
        {isLoading && (
          <div className="chat-message bot-message" aria-label="Bot is typing">
            <div className="message-content">
              <div className="loading-indicator" aria-label="Loading indicator"></div>
              <span style={{marginLeft: '10px'}}>Processing your request...</span>
            </div>
          </div>
        )}
      </div>
      <div className="chatbot-input-container" role="form" aria-label="Chat input">
        <ChatInput onSendMessage={handleSendMessage} sessionId={sessionId} />
      </div>
    </div>
  );
};

export default ChatbotWindow;