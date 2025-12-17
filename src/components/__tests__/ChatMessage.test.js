// Basic test structure for ChatMessage component
// In a real project, these would be run with Jest + React Testing Library

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../Chatbot/ChatMessage';

describe('ChatMessage Component', () => {
  test('renders user message correctly', () => {
    render(
      <ChatMessage 
        message="Hello, this is a test message" 
        sender="user" 
        sources={[]}
      />
    );
    
    expect(screen.getByText("Hello, this is a test message")).toBeInTheDocument();
    const messageElement = screen.getByText("Hello, this is a test message").closest('.chat-message');
    expect(messageElement).toHaveClass('user-message');
  });
  
  test('renders bot message correctly', () => {
    render(
      <ChatMessage 
        message="Hello, this is a bot response" 
        sender="bot" 
        sources={[]}
      />
    );
    
    expect(screen.getByText("Hello, this is a bot response")).toBeInTheDocument();
    const messageElement = screen.getByText("Hello, this is a bot response").closest('.chat-message');
    expect(messageElement).toHaveClass('bot-message');
  });
  
  test('renders sources when provided', () => {
    const sources = [
      { sourceTitle: "Test Source", sourceUrl: "/test" }
    ];
    
    render(
      <ChatMessage 
        message="Hello, this is a bot response" 
        sender="bot" 
        sources={sources}
      />
    );
    
    expect(screen.getByText("Sources:")).toBeInTheDocument();
    expect(screen.getByText("Test Source")).toBeInTheDocument();
  });
});