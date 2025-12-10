// Main backend configuration
const config = {
  // Server settings
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Database settings
  database: {
    // For the RAG functionality, we'll use ChromaDB
    chroma: {
      endpoint: process.env.CHROMA_ENDPOINT || 'http://localhost:8000',
      collectionName: process.env.CHROMA_COLLECTION || 'physical_ai_book'
    }
  },

  // API Keys and external services
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || null,  // Optional, as LLM features are supplementary
    googleTranslate: process.env.GOOGLE_TRANSLATE_API_KEY || null
  },

  // Content settings
  content: {
    baseDir: process.env.CONTENT_BASE_DIR || '../docs', // Relative to backend directory
    supportedFormats: ['.md', '.txt', '.html'],
    maxFileSize: 10 * 1024 * 1024  // 10MB in bytes
  },

  // Security settings
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // Limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // Feature flags
  features: {
    ragSearch: process.env.ENABLE_RAG_SEARCH !== 'false',
    translation: process.env.ENABLE_TRANSLATION !== 'false',
    chat: process.env.ENABLE_CHAT !== 'false'
  },

  // Safety and validation settings
  safety: {
    constitutionCompliance: true,
    contentValidation: true,
    maxSearchResults: 10,
    maxChatHistory: 50  // Maximum number of chat history items to retain
  },

  // Validation for safety and constitution compliance
  validation: {
    // Safety validation functions would go here
    validateContent: (content) => {
      // In a real implementation, this would check content against safety guidelines
      return {
        isSafe: true,
        issues: [],
        confidence: 1.0
      };
    }
  }
};

module.exports = config;