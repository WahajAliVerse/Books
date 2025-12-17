import React, { useState } from 'react';
import FloatingIcon from '../FloatingIcon/FloatingIcon';
import ChatbotWindow from './ChatbotWindow';
import './chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {isOpen && <ChatbotWindow onClose={toggleChat} />}
      <FloatingIcon onClick={toggleChat} isOpen={isOpen} />
    </div>
  );
};

export default Chatbot;