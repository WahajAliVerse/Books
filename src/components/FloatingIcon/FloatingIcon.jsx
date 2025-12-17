import React from 'react';
import '@site/src/css/chatbot.css';

const FloatingIcon = ({ onClick, isOpen }) => {
  const iconStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    backgroundColor: '#4a6cf7',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
  };

  const chatIconStyle = {
    fontSize: '28px',
  };

  return (
    <div 
      className={`floating-icon ${isOpen ? 'hidden' : ''}`} 
      onClick={onClick}
      style={iconStyle}
    >
      <div style={chatIconStyle}>💬</div>
    </div>
  );
};

export default FloatingIcon;