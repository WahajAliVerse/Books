// Additional backend API endpoints
const express = require('express');
const router = express.Router();
const config = require('../config');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      ragSearch: config.features.ragSearch,
      translation: config.features.translation,
      chat: config.features.chat
    }
  });
});

// Configuration endpoint - returns non-sensitive config values
router.get('/config', (req, res) => {
  const publicConfig = {
    features: config.features,
    content: {
      supportedFormats: config.content.supportedFormats
    }
  };
  
  res.json(publicConfig);
});

// Safety validation endpoint - checks if content complies with safety guidelines
router.post('/validate-safety', (req, res) => {
  const { content, contentType } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required for validation' });
  }
  
  // In a real implementation, this would run content through safety validation
  // For this example, we'll return a mock validation result
  const validationResult = config.validation.validateContent(content);
  
  res.json({
    ...validationResult,
    timestamp: new Date().toISOString()
  });
});

// Constitution compliance check endpoint
router.post('/constitution-check', (req, res) => {
  const { action, parameters } = req.body;
  
  if (!action) {
    return res.status(400).json({ error: 'Action is required for constitution check' });
  }
  
  // In a real implementation, this would check if an action complies with the constitution
  // For this example, we'll return a mock compliance check
  res.json({
    action,
    isCompliant: true,
    checks: [
      { check: 'Safety-First Design', passed: true, details: 'Action prioritizes human safety' },
      { check: 'Modular Architecture', passed: true, details: 'Action follows modular approach' },
      { check: 'Deterministic Communication', passed: true, details: 'Communication is reliable where needed' },
      { check: 'AI Transparency', passed: true, details: 'Decision making is traceable' },
      { check: 'Simulation-to-Reality Transfer', passed: true, details: 'Behavior validated in simulation' },
      { check: 'Human-in-the-Loop Override', passed: true, details: 'Human control maintained' }
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;