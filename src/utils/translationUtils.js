// Utility functions for translation functionality

/**
 * Translates text using the backend translation API
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language code (default: 'ur')
 * @param {string} sourceLang - The source language code (default: 'en')
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, targetLang = 'ur', sourceLang = 'en') => {
  if (!text) return '';
  
  try {
    // In a real implementation, this would call the backend API
    // const response = await fetch('/api/translate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ text, targetLang, sourceLang })
    // });
    //
    // const data = await response.json();
    // return data.translatedText;

    // For this example, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
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
          "Section": "حصہ",
          "The Robotic Nervous System": "روبوٹک نروس سسٹم",
          "Digital Twin": "ڈیجیٹل ٹوئن",
          "AI Transparency": "ذہانت کی شفافیت",
          "Vision Language Action": "وژن لینگویج ایکشن"
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
      }, 500); // Simulate network delay
    });
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
};

/**
 * Translates an entire page by translating all text elements
 * @param {string} targetLang - The target language code
 * @returns {Promise<void>}
 */
export const translatePage = async (targetLang = 'ur') => {
  try {
    // Get all text elements that should be translated
    const translatableElements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, a'
    );
    
    // Keep original text for restoration
    if (!document.body.dataset.originalContent) {
      document.body.dataset.originalContent = 'true';
      translatableElements.forEach(el => {
        el.dataset.originalText = el.textContent;
      });
    }
    
    for (const element of translatableElements) {
      const originalText = element.dataset.originalText || element.textContent;
      
      if (originalText.trim()) {
        element.textContent = await translateText(originalText, targetLang);
      }
    }
  } catch (error) {
    console.error('Page translation error:', error);
    throw error;
  }
};

/**
 * Restores original text content to all elements on the page
 * @returns {void}
 */
export const restorePage = () => {
  if (!document.body.dataset.originalContent) {
    return; // Page was never translated
  }
  
  const translatableElements = document.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, a'
  );
  
  translatableElements.forEach(el => {
    if (el.dataset.originalText) {
      el.textContent = el.dataset.originalText;
    }
  });
  
  // Remove the marker to indicate content is restored
  delete document.body.dataset.originalContent;
};