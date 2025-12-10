import React, { useState, useEffect } from 'react';

const UrduTranslation = ({ text }) => {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTranslated, setIsTranslated] = useState(false);

  // In a real implementation, this would call the backend translation API
  // For this example, we'll simulate the translation
  const translateToUrdu = async (textToTranslate) => {
    if (!textToTranslate) return '';
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // This is a mock translation function
      // In a real implementation, this would call the backend translation API
      const mockTranslations = {
        "Introduction to Physical AI": "فزیکل اے آئی کا تعارف",
        "Humanoid Robotics": "ہیومنوائڈ روبوٹکس",
        "Safety First": "پہلے حفاظت",
        "ROS 2": "آر او ایس 2",
        "The Robotic Nervous System": "روبوٹک نروس سسٹم",
        "Digital Twin": "ڈیجیٹل ٹوئن",
        "AI Transparency": "ذہانت کی شفافیت",
        "Simulation to Reality": "حقیقت میں تبدیلی کے لئے ہم آہنگی",
        "Vision Language Action": "وژن لینگویج ایکشن",
        "Constitution": "آئین",
        "Safety Principles": "حفاظت کے اصول"
      };
      
      // Simple translation for demonstration
      let result = textToTranslate;
      Object.keys(mockTranslations).forEach(english => {
        result = result.replace(new RegExp(english, 'gi'), mockTranslations[english]);
      });
      
      // For text not in our mock dictionary, we'll add a prefix
      if (result === textToTranslate) {
        result = `[URDU: ${textToTranslate}]`;
      }
      
      return result;
    } catch (err) {
      setError('Translation failed');
      console.error('Translation error:', err);
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!text) return;
    
    const result = await translateToUrdu(text);
    setTranslatedText(result);
    setIsTranslated(true);
  };

  const handleRestore = () => {
    setTranslatedText('');
    setIsTranslated(false);
    setError(null);
  };

  // Auto-translate if text prop changes
  useEffect(() => {
    if (text && !isTranslated) {
      translateToUrdu(text).then(result => {
        if (result) {
          setTranslatedText(result);
          setIsTranslated(true);
        }
      });
    }
  }, [text]);

  return (
    <div className="urdu-translation-component">
      {isLoading && (
        <div className="loading-indicator">
          <p>Translating to Urdu...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      {isTranslated && !isLoading && (
        <div className="translation-container">
          <div className="translation-content">
            <p>{translatedText}</p>
          </div>
          <button onClick={handleRestore} className="restore-button">
            Show Original
          </button>
        </div>
      )}
      
      {!isTranslated && !isLoading && !error && text && (
        <button onClick={handleTranslate} className="translate-button">
          Translate to Urdu
        </button>
      )}
    </div>
  );
};

export default UrduTranslation;