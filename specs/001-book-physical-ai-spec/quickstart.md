# Quickstart Guide: Physical AI & Humanoid Robotics Book

## Getting Started

This guide will help you set up the development environment for the "Physical AI & Humanoid Robotics: Design, Simulation, and Deployment" book project.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- A modern web browser
- Basic knowledge of Markdown and JavaScript

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run start
   # or
   yarn start
   ```

4. Open your browser at `http://localhost:3000` to view the book.

## Project Structure

```
docs/                       # Book content in Markdown
├── intro.md               # Introduction chapter
├── chapter1/              # Module 1: The Robotic Nervous System (ROS 2)
├── chapter2/              # Module 2: The Digital Twin (Gazebo & Unity)
├── chapter3/              # Module 3: The AI-Robot Brain (NVIDIA Isaac)
├── chapter4/              # Module 4: Vision-Language-Action (VLA)
└── appendix/              # Appendix with constitution
src/                       # Custom React components
├── components/            # Reusable UI components
├── pages/                 # Standalone pages (chatbot, profile)
└── theme/                 # Custom theme components
backend/                   # Backend API for RAG chatbot
├── api/                   # API endpoints
└── config/                # Backend configuration
static/                    # Static assets (images, custom JS)
```

## Creating New Content

1. To add a new section to a chapter, create a new `.md` or `.mdx` file in the appropriate chapter directory in `docs/`
2. Add the new file to `sidebars.js` to make it appear in the navigation
3. Use standard Markdown syntax with support for:
   - Code blocks with syntax highlighting
   - Image placeholders with `![Description](/img/image.png)` format
   - Cross-references to constitution with links

## Running the RAG Chatbot Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run start
   ```

## Building for Production

To create a production build of the book:

```bash
npm run build
```

This will generate a `build/` directory with statically rendered content that can be deployed to any web server.

## Custom Features

### RAG Chatbot
Access the RAG-powered chatbot at `/chatbot` to ask questions about the book content.

### User Profile & Personalization
Visit `/profile` to manage your reading preferences, theme, and reading level.

### Urdu Translation
Use the translation button on any page to translate the content to Urdu using Google Translate API.