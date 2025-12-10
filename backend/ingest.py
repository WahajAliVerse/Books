#!/usr/bin/env python3
"""
Content Ingestion Script for RAG (Retrieval-Augmented Generation)

This script ingests book content into a vector database for RAG functionality.
It processes documents from the docs/ directory and creates embeddings for search.
"""

import os
import sys
import json
import argparse
from typing import List, Dict, Any
import hashlib
from pathlib import Path

try:
    import chromadb
    from chromadb.config import Settings
    from chromadb.utils import embedding_functions
except ImportError:
    print("Error: chromadb not found. Please install with: pip install chromadb")
    sys.exit(1)

try:
    import openai
except ImportError:
    print("Warning: openai not found. Using default embedding function.")

def extract_text_from_md(file_path: Path) -> str:
    """Extract text content from markdown file, excluding frontmatter."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove YAML frontmatter if present
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            content = parts[2]
    
    return content

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # If we're near the end, make sure to include the remainder
        if end >= len(text):
            chunks.append(text[start:])
            break
        
        # Find a good break point (try to end at sentence boundary)
        chunk = text[start:end]
        
        # Find the last sentence ending within the chunk
        last_period = chunk.rfind('.')
        if last_period > len(chunk) // 2:  # Don't cut too early
            end = start + last_period + 1
            chunk = text[start:end]
        
        chunks.append(chunk)
        start = end - overlap  # Apply overlap
    
    return chunks

def process_docs_directory(docs_path: str, chunk_size: int = 1000, overlap: int = 100) -> List[Dict[str, Any]]:
    """Process all markdown files in the docs directory."""
    documents = []
    
    docs_dir = Path(docs_path)
    if not docs_dir.exists():
        print(f"Error: Docs directory {docs_path} does not exist")
        return []
    
    # Recursively find all markdown files
    md_files = list(docs_dir.rglob("*.md"))
    
    for file_path in md_files:
        print(f"Processing: {file_path}")
        
        try:
            content = extract_text_from_md(file_path)
            chunks = chunk_text(content, chunk_size, overlap)
            
            for i, chunk in enumerate(chunks):
                # Create a unique ID for this chunk
                chunk_id = hashlib.md5(f"{file_path}:{i}:{chunk[:50]}".encode()).hexdigest()
                
                documents.append({
                    "id": chunk_id,
                    "content": chunk,
                    "source": str(file_path.relative_to(docs_dir)),
                    "chunk_index": i,
                    "metadata": {
                        "source": str(file_path.relative_to(docs_dir)),
                        "chunk_index": i,
                        "original_file": file_path.name
                    }
                })
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"Processed {len(documents)} chunks from {len(md_files)} files")
    return documents

def ingest_content(documents: List[Dict[str, Any]], collection_name: str = "physical_ai_book", 
                   persist_dir: str = "./chroma_data"):
    """Ingest documents into ChromaDB."""
    # Initialize ChromaDB client
    client = chromadb.PersistentClient(path=persist_dir)
    
    # Try to get the existing collection or create a new one
    try:
        collection = client.get_collection(collection_name)
        print(f"Found existing collection: {collection_name}")
    except:
        # Create new collection with default embedding function
        embedding_function = embedding_functions.DefaultEmbeddingFunction()
        collection = client.create_collection(
            name=collection_name,
            embedding_function=embedding_function
        )
        print(f"Created new collection: {collection_name}")
    
    # Prepare data for ingestion
    ids = [doc["id"] for doc in documents]
    contents = [doc["content"] for doc in documents]
    metadatas = [doc["metadata"] for doc in documents]
    
    # Add documents to collection
    print(f"Ingesting {len(documents)} documents...")
    collection.add(
        documents=contents,
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"Successfully ingested {len(documents)} documents into collection: {collection_name}")
    print(f"Collection now contains {collection.count()} documents")

def main():
    parser = argparse.ArgumentParser(description="Ingest book content into ChromaDB for RAG")
    parser.add_argument("--docs-path", default="../docs", help="Path to docs directory (default: ../docs)")
    parser.add_argument("--collection-name", default="physical_ai_book", help="Name of the collection (default: physical_ai_book)")
    parser.add_argument("--chunk-size", type=int, default=1000, help="Size of text chunks (default: 1000)")
    parser.add_argument("--overlap", type=int, default=100, help="Overlap between chunks (default: 100)")
    parser.add_argument("--persist-dir", default="./chroma_data", help="Directory to persist ChromaDB (default: ./chroma_data)")
    
    args = parser.parse_args()
    
    print("Starting content ingestion process...")
    print(f"Documents path: {args.docs_path}")
    print(f"Collection name: {args.collection_name}")
    print(f"Chunk size: {args.chunk_size}, Overlap: {args.overlap}")
    print(f"Persist directory: {args.persist_dir}")
    
    # Process documents
    documents = process_docs_directory(
        args.docs_path, 
        args.chunk_size, 
        args.overlap
    )
    
    if not documents:
        print("No documents to process. Exiting.")
        return
    
    # Ingest into database
    ingest_content(documents, args.collection_name, args.persist_dir)
    
    print("Content ingestion completed successfully!")

if __name__ == "__main__":
    main()