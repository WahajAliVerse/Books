import { useState, useCallback } from 'react';

// Custom hook for translation functionality
const useTranslate = () => {
  const [translationCache, setTranslationCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to translate text
  const translate = useCallback(async (text, targetLang = 'ur', sourceLang = 'en') => {
    // Return cached translation if available
    const cacheKey = `${text}-${sourceLang}-${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the backend translation API
      // For this example, we'll simulate an API call
      const response = await simulateTranslationAPI(text, targetLang, sourceLang);
      
      // Cache the result
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: response
      }));
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [translationCache]);

  // Function to check if text is already in cache
  const isCached = (text, targetLang = 'ur', sourceLang = 'en') => {
    const cacheKey = `${text}-${sourceLang}-${targetLang}`;
    return !!translationCache[cacheKey];
  };

  // Function to clear cache
  const clearCache = useCallback(() => {
    setTranslationCache({});
  }, []);

  // Simulate translation API call (in a real app, this would be an actual API call)
  const simulateTranslationAPI = (text, targetLang, sourceLang) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // This is a simplified mock translation
        // In a real implementation, this would call the actual translation API
        if (targetLang === 'ur') {
          // Simple English to Urdu "translation" for demonstration
          const mockTranslations = {
            "Introduction": "تعارف",
            "Physical AI": "فزیکل اے آئی",
            "Humanoid Robotics": "ہیومنوائڈ روبوٹکس",
            "Safety": "حفاظت",
            "Constitution": "آئین",
            "ROS 2": "آر او ایس 2",
            "Simulation": "ہم آہنگی",
            "Navigation": "راہ نما",
            "AI": "ذہانت",
            "Robotics": "روبوٹکس",
            "Chapter": "باب",
            "Section": "حصہ"
          };

          // Simple word-by-word translation for demo
          let translated = text;
          Object.keys(mockTranslations).forEach(english => {
            translated = translated.replace(new RegExp(english, 'gi'), mockTranslations[english]);
          });

          // If no translation found, return a placeholder
          if (translated === text) {
            translated = `[URDU: ${text}]`;
          }

          resolve(translated);
        } else {
          reject(new Error('Only Urdu translation is supported in this demo'));
        }
      }, 800); // Simulate network delay
    });
  };

  return {
    translate,
    isLoading,
    error,
    isCached,
    clearCache,
    // Additional utility functions
    languages: [
      { code: 'en', name: 'English' },
      { code: 'ur', name: 'Urdu' }
    ]
  };
};

export default useTranslate;