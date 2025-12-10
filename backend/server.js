const express = require('express');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const config = {
  // In a real application, these would come from environment variables
  openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-key-here',
  chromaEndpoint: process.env.CHROMA_ENDPOINT || 'http://localhost:8000',
  // Add other configuration parameters
};

// Initialize OpenAI API if key is available
let openai = null;
if (config.openaiApiKey && config.openaiApiKey !== 'your-openai-key-here') {
  const openaiConfig = new Configuration({
    apiKey: config.openaiApiKey,
  });
  openai = new OpenAIApi(openaiConfig);
}

// Import API routes
const ragSearchRouter = require('./api/rag-search');
const translateRouter = require('./api/translate');

// Use API routes
app.use('/api/rag-search', ragSearchRouter);
app.use('/api/translate', translateRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = { app, config };