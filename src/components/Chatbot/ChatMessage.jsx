import React from 'react';
import '@site/src/css/chatbot.css';

const ChatMessage = ({ message, sender, sources, isError }) => {
  // Determine message class based on sender and error status
  let messageClass = `chat-message ${sender}-message`;
  if (isError) {
    messageClass += ' error-message';
  }

  return (
    <div className={messageClass}>
      <div className="message-content">{message}</div>
      {sources && sources.length > 0 && !isError && (
        <div className="message-sources">
          <details>
            <summary>Sources:</summary>
            <ul>
              {sources.map((source, index) => (
                <li key={index}>
                  <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {source.sourceTitle}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;