# Quickstart: RAG-based Chatbot for Docusaurus Book

## Overview
This guide provides a quick setup for the RAG-based chatbot feature in your Docusaurus book. The chatbot allows users to ask questions about the book content and receive AI-generated responses based on all chapters.

## Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Access to an LLM provider (OpenAI API key or local model)
- Docusaurus project already set up

## Installation Steps

### 1. Setup Backend Service
```bash
# Navigate to the backend directory
cd backend/rag-service

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 2. Index Book Content
```bash
# Run the document processor to create vector embeddings of your book content
python src/services/document-processor.py

# This will parse your Docusaurus content and store embeddings in the vector database
```

### 3. Install Frontend Components
```bash
# The React components are located at src/components/Chatbot/
# Install any additional npm packages if needed
npm install react-markdown@6.0.0
```

### 4. Integrate with Docusaurus
```javascript
// In your Docusaurus configuration (docusaurus.config.js)
// Add the chatbot component to your theme configuration
module.exports = {
  themeConfig: {
    // ... other config
    chatbot: {
      enabled: true,
      position: "bottom-right",  // Position of the floating chat icon
    }
  }
};
```

### 5. Run the Application
```bash
# Terminal 1: Start the RAG backend service
cd backend/rag-service
python -m src.api.chat-api

# Terminal 2: Start the Docusaurus development server
cd /path/to/your/docusaurus
npm run start
```

## Environment Variables

Create a `.env` file in the backend/rag-service directory:

```bash
# LLM Provider Configuration
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai  # or anthropic, ollama, etc.

# Vector Database Configuration
VECTOR_DB=chromadb  # or pinecone, supabase, etc.
PINECONE_API_KEY=your_pinecone_api_key  # if using Pinecone
SUPABASE_URL=your_supabase_url  # if using Supabase
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key  # if using Supabase

# Application Configuration
RAG_SERVICE_PORT=8000
EMBEDDING_MODEL=text-embedding-ada-002
CHAT_MODEL=gpt-4-turbo  # or gpt-3.5-turbo, claude-3-opus, etc.
```

## Usage

1. The chatbot icon will appear at the bottom right of all pages
2. Click the icon to open the chat interface
3. Type your question about the book content
4. The chatbot will respond based on relevant information from the book chapters
5. Responses will include source references to the original content

## Development

### Adding New Content
When new book content is added:
1. Re-run the document processor to update the vector store:
```bash
python src/services/document-processor.py
```

### Customizing the UI
- Modify components in `src/components/Chatbot/`
- Update styles in `src/css/chatbot.css`
- The UI follows Material Design principles and integrates with Docusaurus styling

## Troubleshooting

### Chatbot not appearing
- Verify that the component is properly included in your Docusaurus layout
- Check browser console for JavaScript errors

### Slow responses
- Verify your LLM provider API key and rate limits
- Check if the vector database is properly indexed

### No relevant results
- Verify that content was properly indexed by the document processor
- Check if embedding quality is sufficient for retrieval