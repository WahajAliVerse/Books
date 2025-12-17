# Data Model: RAG-based Chatbot for Docusaurus Book

## Entities

### Chat Session
**Description**: Represents a conversation between the user and the chatbot, containing the history of queries and responses
**Fields**:
- `sessionId`: string (unique identifier)
- `userId`: string (identifier for the user, could be anonymous)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `messages`: array of Message objects
- `isActive`: boolean

### Message
**Description**: Represents a single message in the conversation
**Fields**:
- `messageId`: string (unique identifier)
- `sessionId`: string (foreign key to Chat Session)
- `sender`: enum ("user", "bot")
- `content`: string (the text content of the message)
- `timestamp`: timestamp
- `sources`: array of SourceReference objects (for RAG responses)

### SourceReference
**Description**: Represents the source of information in a chatbot response
**Fields**:
- `sourceId`: string (identifier for the source)
- `sourceTitle`: string (title of the source, e.g. chapter title)
- `sourceUrl`: string (URL to the original content)
- `contentExcerpt`: string (relevant excerpt from the source)
- `relevanceScore`: number (confidence score of relevance, 0-1)

### BookContentChunk
**Description**: Represents a chunk of book content used for RAG retrieval
**Fields**:
- `chunkId`: string (unique identifier)
- `title`: string (title of the content section)
- `content`: string (the actual content text)
- `sourceUrl`: string (URL of the original document)
- `embedding`: array of numbers (vector representation of the content)
- `metadata`: object (additional metadata like chapter, section, etc.)

### Query
**Description**: Represents a text input from the user requesting information about the book content
**Fields**:
- `queryId`: string (unique identifier)
- `sessionId`: string (foreign key to Chat Session)
- `content`: string (the user's question/query)
- `timestamp`: timestamp
- `processed`: boolean (whether the query has been processed)

### Response
**Description**: Represents the generated answer from the chatbot based on relevant book content
**Fields**:
- `responseId`: string (unique identifier)
- `queryId`: string (foreign key to Query)
- `sessionId`: string (foreign key to Chat Session)
- `content`: string (the chatbot's response)
- `timestamp`: timestamp
- `sources`: array of SourceReference objects
- `relevanceScore`: number (overall relevance score, 0-1)

## Relationships

- Chat Session contains many Messages (1 to many)
- Message belongs to one Chat Session
- Message has many SourceReferences (for RAG responses)
- Query belongs to one Chat Session
- Response belongs to one Query
- Response belongs to one Chat Session
- Response references multiple BookContentChunks through SourceReferences

## Validation Rules

### Chat Session
- `sessionId` must be unique
- `createdAt` must be less than or equal to `updatedAt`
- `messages` array should not exceed a reasonable size (e.g., 50 messages) to prevent performance issues

### Message
- `sender` must be either "user" or "bot"
- `content` must be non-empty
- `timestamp` must be within reasonable bounds

### SourceReference
- `relevanceScore` must be between 0 and 1
- `sourceUrl` must be a valid URL

### BookContentChunk
- `embedding` must be a valid vector array
- `content` must be non-empty

## State Transitions

### Chat Session
- New session starts with `isActive: true`
- Session can be closed with `isActive: false`
- Session is marked inactive when user explicitly closes chat or after inactivity timeout