# Data Model: Physical AI & Humanoid Robotics Book

## Key Entities

### Book
- **Fields**: title, description, slug, chapters, author, publication_date, version
- **Relationships**: Contains multiple Chapter entities
- **Validation rules**: Title is required, chapters must be between 1-10

### Chapter
- **Fields**: id, title, content, word_count, images, code_snippets, cross_references
- **Relationships**: Belongs to a Book entity, contains multiple ContentBlock entities
- **Validation rules**: Title is required, word_count should be ~2500 as specified
- **State transitions**: Draft → Review → Published

### ContentBlock
- **Fields**: id, type (text, code, image, diagram), content, metadata
- **Relationships**: Belongs to a Chapter entity
- **Validation rules**: Content is required, type must be one of predefined values

### CodeSnippet
- **Fields**: id, language, code, description, execution_context
- **Relationships**: Belongs to a ContentBlock entity
- **Validation rules**: Language and code are required

### ImagePlaceholder
- **Fields**: id, description, path, alt_text, caption
- **Relationships**: Belongs to a ContentBlock entity
- **Validation rules**: Description and path are required

### UserProfile
- **Fields**: id, preferences, reading_level, theme, language
- **Relationships**: Associated with zero or more UserInteraction entities
- **Validation rules**: Preferences stored in localStorage as JSON

### UserInteraction
- **Fields**: id, user_id, interaction_type, content_id, timestamp, rating
- **Relationships**: Belongs to a UserProfile entity
- **Validation rules**: Type must be one of: view, search, rate, translate

### ChatbotQuery
- **Fields**: id, query_text, response_text, timestamp, source_chapters, confidence_score
- **Relationships**: May be associated with a UserProfile entity
- **Validation rules**: Query text is required, confidence score between 0-1

### TranslationCache
- **Fields**: id, source_text, translated_text, source_language, target_language, timestamp
- **Relationships**: Used by TranslationService
- **Validation rules**: All fields are required