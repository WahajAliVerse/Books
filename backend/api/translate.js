const express = require('express');
const router = express.Router();

// Translation endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang = 'ur', sourceLang = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }
    
    if (targetLang !== 'ur') {
      return res.status(400).json({ error: 'Only Urdu translation is currently supported' });
    }
    
    // In a real implementation, this would call a translation API like Google Translate
    // For this example, we'll return placeholder text
    const translatedText = await mockTranslateToUrdu(text);
    
    res.json({
      originalText: text,
      translatedText,
      sourceLang,
      targetLang,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
});

// Mock translation function (in a real implementation, this would use Google Translate API)
async function mockTranslateToUrdu(text) {
  // This is a mock function that returns placeholder Urdu text
  // In a real implementation, this would call the Google Translate API
  const mockTranslations = {
    "Introduction": "تعارف",
    "Chapter 1": "باب 1",
    "Chapter 2": "باب 2", 
    "Chapter 3": "باب 3",
    "Chapter 4": "باب 4",
    "Humanoid Robotics": "ہیومنوائڈ روبوٹکس",
    "Physical AI": "فزیکل اے آئی",
    "ROS 2": "آر او ایس 2",
    "Safety": "حفاظت",
    "Simulation": "ہم آہنگی",
    "Navigation": "راہ نما",
    "Vision-Language-Action": "وژن-لینگویج-ایکشن",
    "AI Transparency": "ذہانت کی شفافیت",
    "Constitution": "آئین",
    "Safety First": "پہلے حفاظت"
  };
  
  // Simple word-by-word translation for demonstration
  const words = text.split(/\s+/);
  const translatedWords = words.map(word => {
    // Check if it's a direct match in our mock dictionary
    if (mockTranslations[word]) {
      return mockTranslations[word];
    }
    
    // For words not in our mock dictionary, return a placeholder
    return `[URDU:${word}]`; // Placeholder indicating translated word
  });
  
  return translatedWords.join(' ');
}

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    supportedLanguages: [
      { code: 'en', name: 'English' },
      { code: 'ur', name: 'Urdu' }
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;