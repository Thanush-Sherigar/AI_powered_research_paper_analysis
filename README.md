# AI-Powered Research Paper Reviewer & Mentor

A comprehensive MERN stack web application that uses AI to analyze, review, and provide mentorship on research papers. Upload PDFs, get intelligent summaries, conference-style reviews, concept graphs, and much more.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### Core Features
- **📄 PDF Upload & Processing**: Upload research papers and automatically extract text, sections, and metadata
- **📝 Multi-Level Summaries**: Get TL;DR, executive paragraph, or detailed section-wise summaries
- **⭐ Conference-Style Reviews**: AI-generated peer reviews with strengths, weaknesses, and scores (0-10)
- **🔍 Semantic Search**: Search across all your papers using natural language queries
- **💬 Q&A with Citations**: Ask questions about papers and get answers with source citations
- **📊 Paper Comparison**: Compare 2-5 papers side-by-side with AI analysis

### Unique AI Features
- **🕸️ Concept Graphs**: Automatically extract concepts, methods, datasets, and their relationships
- **🎯 Novelty Radar**: Detect overlap and identify unique contributions across papers
- **🧪 Experiment Suggestions**: Get AI-powered experiment ideas based on papers and your project
- **📚 Reading Path Generator**: Get ordered reading recommendations based on topic and expertise level
- **✅ Citation Quality Checker**: Verify if citations support claims and detect overclaiming
- **🔗 Resource Detector**: Extract datasets, code repositories, and reproducibility information

## 🏗️ Architecture

```
paper_reviewer/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── db/             # MongoDB connection
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic (PDF, LLM, embeddings, analysis)
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── utils/          # JWT, chunking, logging
│   │   ├── prompts/        # LLM prompt templates
│   │   ├── app.js          # Express app
│   │   └── server.js       # Server bootstrap
│   └── package.json
│
└── frontend/               # React + Vite + Tailwind
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── services/       # API client
    │   ├── context/        # Auth context
    │   ├── App.jsx         # Main app with routing
    │   └── main.jsx        # Entry point
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** (local or MongoDB Atlas)
- **OpenAI API Key** (for LLM and embeddings)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/paper_reviewer
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paper_reviewer

   # JWT Secrets (change these!)
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

   # OpenAI API
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # LLM Configuration
   LLM_MODEL=gpt-4-turbo-preview
   # For cheaper option: gpt-3.5-turbo

   # Embedding Configuration
   EMBEDDING_MODEL=text-embedding-3-small
   ```

5. **Start the backend**:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### First Steps

1. Open `http://localhost:5173` in your browser
2. **Register** a new account
3. **Create** your first project
4. **Upload** a research paper PDF
5. Explore the AI-powered features!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Projects
- `GET /api/projects` - Get all user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Papers
- `POST /api/papers/upload` - Upload PDF (multipart/form-data)
- `POST /api/papers/add-by-doi` - Add paper by DOI/arXiv (stub)
- `GET /api/papers/:id` - Get paper details
- `DELETE /api/papers/:id` - Delete paper

### Analysis
- `GET /api/papers/:id/summaries?mode=tldr|paragraph|detailed` - Get summaries
- `POST /api/papers/:id/review` - Generate conference-style review
- `POST /api/compare` - Compare multiple papers
- `POST /api/search` - Semantic search across papers
- `POST /api/ask` - Ask questions about papers
- `GET /api/papers/:id/concept-graph` - Get concept graph
- `GET /api/projects/:id/novelty-radar` - Analyze novelty across project
- `POST /api/papers/:id/suggest-experiments` - Get experiment suggestions
- `POST /api/reading-path` - Generate reading path
- `POST /api/citation-check` - Check citation quality
- `GET /api/papers/:id/resources-summary` - Get datasets/code info

### Notes
- `GET /api/papers/:id/notes` - Get all notes for paper
- `POST /api/papers/:id/notes` - Create manual note
- `POST /api/papers/:id/ai-notes` - Generate AI note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## 🧠 AI Services Architecture

### LLM Service (Swappable Providers)
```javascript
// Abstract base class
class LLMClient {
  async generate(prompt, options) { }
  async generateJSON(prompt, options) { }
}

// Implementations
- OpenAILLMClient (default)
- LocalLLMClient (placeholder for local models)

// Usage
const llm = getLLMClient(); // Returns configured provider
const response = await llm.generate(prompt);
```

### Embedding Service (Swappable Providers)
```javascript
// Abstract base class
class EmbeddingClient {
  async embed(texts) { }
  getDimensions() { }
}

// Implementations
- OpenAIEmbeddingClient (default)
- LocalEmbeddingClient (placeholder for local embeddings)

// Usage
const embedder = getEmbeddingClient();
const embeddings = await embedder.embed(texts);
```

### PDF Processing Pipeline
1. **Extract** text using `pdf-parse`
2. **Detect** sections (Intro, Methods, Results, etc.)
3. **Clean** and normalize text
4. **Extract** metadata (title, authors, abstract)
5. **Chunk** text for embeddings
6. **Generate** embeddings for semantic search
7. **Store** in MongoDB with vector index

## 🎨 Frontend Design

### Tech Stack
- **React 18** with hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Flow** for concept graphs
- **Recharts** for visualizations

### Design Principles
- **Glassmorphism** effects for modern UI
- **Gradient** accents and animations
- **Dark mode** by default
- **Responsive** design
- **Smooth transitions** and micro-animations

## 🔒 Security

- **JWT-based authentication** with access and refresh tokens
- **Password hashing** using bcrypt (10 rounds)
- **Role-based access control** (user/admin)
- **Request validation** and sanitization
- **CORS** configuration
- **Ownership verification** for all resources

## 📊 Database Schema

### User
```javascript
{
  email: String (unique),
  passwordHash: String,
  name: String,
  role: 'user' | 'admin',
  timestamps
}
```

### Project
```javascript
{
  userId: ObjectId (ref User),
  name: String,
  description: String,
  papers: [ObjectId] (ref Paper),
  metadata: { paperCount, lastActivity },
  timestamps
}
```

### Paper
```javascript
{
  projectId: ObjectId (ref Project),
  title: String,
  authors: [String],
  abstract: String,
  keywords: [String],
  sourceType: 'upload' | 'doi' | 'arxiv' | 'url',
  sections: [{ name, content }],
  rawText: String,
  cleanText: String,
  metadata: { year, venue, pageCount, etc. },
  cachedAnalyses: { summaries, review, conceptGraph, etc. },
  timestamps
}
```

### EmbeddingChunk
```javascript
{
  paperId: ObjectId (ref Paper),
  projectId: ObjectId (ref Project),
  section: String,
  text: String,
  embedding: [Number], // Vector for similarity search
  chunkIndex: Number,
  timestamps
}
```

### Note
```javascript
{
  paperId: ObjectId (ref Paper),
  userId: ObjectId (ref User),
  content: String,
  type: 'manual' | 'ai',
  section: String,
  metadata: { prompt, model },
  timestamps
}
```

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `OPENAI_API_KEY` - OpenAI API key
- `LLM_MODEL` - LLM model to use (default: gpt-4-turbo-preview)
- `EMBEDDING_MODEL` - Embedding model (default: text-embedding-3-small)

**Frontend** (optional `.env`):
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## 🚢 Deployment

### Backend (Node.js)
- Deploy to **Heroku**, **Railway**, **Render**, or **AWS**
- Set environment variables in platform settings
- Ensure MongoDB is accessible (use MongoDB Atlas for cloud)

### Frontend (React)
- Build: `npm run build`
- Deploy to **Vercel**, **Netlify**, or **AWS S3 + CloudFront**
- Set `VITE_API_URL` to your backend URL

## 🛠️ Development

### Running Tests
```bash
# Backend (when implemented)
cd backend
npm test

# Frontend (when implemented)
cd frontend
npm test
```

### Code Structure
- **ES Modules** throughout (modern JavaScript)
- **Async/await** for all async operations
- **Error handling** with try-catch and middleware
- **Logging** with custom logger utility
- **Comments** for complex logic

## 📝 Example API Usage

### Upload a Paper
```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('projectId', projectId);

const response = await fetch('http://localhost:5000/api/papers/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Get Summary
```javascript
const response = await fetch(
  'http://localhost:5000/api/papers/PAPER_ID/summaries?mode=tldr',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
const { summary } = await response.json();
```

### Ask a Question
```javascript
const response = await fetch('http://localhost:5000/api/ask', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'What datasets were used in this study?',
    projectId: 'PROJECT_ID'
  })
});
const { answer, citations } = await response.json();
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your research or commercial applications.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 and embedding models
- **pdf-parse** for PDF text extraction
- **MongoDB** for flexible document storage
- **React** and **Vite** for modern frontend development

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for researchers by researchers**
