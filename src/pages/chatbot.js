import React from 'react';
import Chatbot from '../components/Chatbot/Chatbot';
import './ChatbotPage.css'; // Create this CSS file for page-level styling

const ChatbotPage = () => {
  return (
    <div className="chatbot-page">
      <header className="chatbot-page-header">
        <h1>Physical AI & Humanoid Robotics Assistant</h1>
        <p>Ask questions about ROS 2, Simulation, AI Systems, and Vision-Language-Action</p>
      </header>
      
      <main className="chatbot-page-main">
        <div className="chatbot-container-wrapper">
          <Chatbot />
        </div>
      </main>
      
      <footer className="chatbot-page-footer">
        <p>This assistant uses RAG (Retrieval-Augmented Generation) to provide answers based on the Physical AI & Humanoid Robotics book content.</p>
        <p>All responses are validated for safety and constitutional compliance.</p>
      </footer>
    </div>
  );
};

export default ChatbotPage;