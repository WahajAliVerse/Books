import React, { useState, useEffect } from 'react';
import FloatingIcon from '@site/src/components/FloatingIcon/FloatingIcon';
import ChatbotWindow from '@site/src/components/Chatbot/ChatbotWindow';

const Root = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Function to handle chat opening/closing
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Close chat when pressing Escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isChatOpen]);

  return (
    <>
      {children}
      <FloatingIcon onClick={toggleChat} isOpen={isChatOpen} />
      {isChatOpen && <ChatbotWindow onClose={toggleChat} />}
    </>
  );
};

export default Root;