import React, { useState } from 'react';
import { translatePage, restorePage } from '../utils/translationUtils';

const TranslationButton = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const toggleLanguage = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (currentLang === 'en') {
        // Switch to Urdu
        await translatePage('ur');
        setCurrentLang('ur');
      } else {
        // Switch back to English
        restorePage();
        setCurrentLang('en');
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`navbar__item navbar__link translation-button ${isLoading ? 'loading' : ''}`}
      onClick={toggleLanguage}
      aria-label={currentLang === 'en' ? "Switch to Urdu" : "Switch to English"}
      disabled={isLoading}
    >
      {isLoading ? (
        <span>Translating... <span className="loading-dots">...</span></span>
      ) : (
        currentLang === 'en' ? 'اردو' : 'English'
      )}
    </button>
  );
};

export default TranslationButton;