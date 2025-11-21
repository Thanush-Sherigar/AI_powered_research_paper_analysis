# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

---

## Project Endpoints

### Get All Projects
**GET** `/projects`

**Response:**
```json
{
  "projects": [
    {
      "_id": "project_id",
      "name": "My Research",
      "description": "Description",
      "papers": [...],
      "metadata": {
        "paperCount": 5,
        "lastActivity": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "count": 1
}
```

### Create Project
**POST** `/projects`

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Optional description"
}
```

### Get Project
**GET** `/projects/:id`

### Update Project
**PUT** `/projects/:id`

### Delete Project
**DELETE** `/projects/:id`

---

## Paper Endpoints

### Upload PDF
**POST** `/papers/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: PDF file
- `projectId`: Project ID

**Response:**
```json
{
  "message": "Paper uploaded and processed successfully",
  "paper": {
    "_id": "paper_id",
    "title": "Paper Title",
    "authors": ["Author 1", "Author 2"],
    "abstract": "Abstract text...",
    "sections": [...],
    "metadata": {...}
  }
}
```

### Get Paper
**GET** `/papers/:id`

### Delete Paper
**DELETE** `/papers/:id`

---

## Analysis Endpoints

### Get Summaries
**GET** `/papers/:id/summaries?mode=tldr|paragraph|detailed`

**Response:**
```json
{
  "summary": "Summary text...",
  "cached": false
}
```

### Generate Review
**POST** `/papers/:id/review`

**Response:**
```json
{
  "review": {
    "summary": "...",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "novelty": "...",
    "soundness": "...",
    "clarity": "...",
    "score": 8,
    "justification": "...",
    "rawReview": "..."
  },
  "cached": false
}
```

### Compare Papers
**POST** `/compare`

**Request Body:**
```json
{
  "paperIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "papers": [...],
  "comparison": "Detailed comparison text...",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Semantic Search
**POST** `/search`

**Request Body:**
```json
{
  "query": "What methods were used?",
  "projectId": "project_id",
  "topK": 5
}
```

**Response:**
```json
{
  "query": "What methods were used?",
  "results": [
    {
      "paperId": "paper_id",
      "paperTitle": "Paper Title",
      "section": "Methods",
      "text": "Relevant text...",
      "similarity": 0.85
    }
  ],
  "count": 5
}
```

### Ask Question
**POST** `/ask`

**Request Body:**
```json
{
  "question": "What datasets were used?",
  "projectId": "project_id",
  "paperId": "optional_paper_id"
}
```

**Response:**
```json
{
  "answer": "Answer text with [1] citations...",
  "supportingEvidence": "Evidence text...",
  "citations": [
    {
      "index": 1,
      "paperId": "paper_id",
      "paperTitle": "Paper Title",
      "section": "Methods",
      "text": "Excerpt..."
    }
  ],
  "confidence": "high|medium|low"
}
```

### Get Concept Graph
**GET** `/papers/:id/concept-graph`

**Response:**
```json
{
  "graph": {
    "nodes": [
      {
        "id": "node1",
        "label": "BERT",
        "type": "model"
      }
    ],
    "edges": [
      {
        "source": "node1",
        "target": "node2",
        "relationship": "uses"
      }
    ],
    "paperId": "paper_id",
    "paperTitle": "Paper Title"
  },
  "cached": false
}
```

### Get Novelty Radar
**GET** `/projects/:id/novelty-radar`

**Response:**
```json
{
  "papers": [
    {
      "title": "Paper Title",
      "noveltyScore": 7,
      "uniqueContributions": ["..."],
      "overlaps": ["..."]
    }
  ],
  "summary": "Overall assessment...",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Suggest Experiments
**POST** `/papers/:id/suggest-experiments`

**Request Body:**
```json
{
  "userIdea": "I want to apply this to medical imaging"
}
```

**Response:**
```json
{
  "paperId": "paper_id",
  "paperTitle": "Paper Title",
  "userIdea": "...",
  "suggestions": "Detailed suggestions...",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Generate Reading Path
**POST** `/reading-path`

**Request Body:**
```json
{
  "projectId": "project_id",
  "topic": "transformer models",
  "level": "intermediate"
}
```

**Response:**
```json
{
  "topic": "transformer models",
  "level": "intermediate",
  "path": [
    {
      "order": 1,
      "title": "Paper Title",
      "rationale": "Why read this first...",
      "keyTakeaways": ["..."],
      "estimatedTime": "2-3 hours"
    }
  ],
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Check Citations
**POST** `/citation-check`

**Request Body:**
```json
{
  "text": "Your draft text with [1] citations...",
  "paperIds": ["id1", "id2"]
}
```

**Response:**
```json
{
  "claims": [
    {
      "originalText": "Claim text",
      "citation": "[1]",
      "isSupported": true,
      "riskLevel": "low",
      "issue": null,
      "suggestion": null
    }
  ],
  "overallAssessment": "...",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Resources Summary
**GET** `/papers/:id/resources-summary`

**Response:**
```json
{
  "resources": {
    "datasets": [
      {
        "name": "ImageNet",
        "url": "http://...",
        "description": "..."
      }
    ],
    "codeRepositories": [
      {
        "platform": "GitHub",
        "url": "http://...",
        "description": "..."
      }
    ],
    "pretrainedModels": [...],
    "reproducibilityNotes": "...",
    "reproducibilityScore": "high|medium|low"
  },
  "cached": false
}
```

---

## Notes Endpoints

### Get Notes
**GET** `/papers/:id/notes`

### Create Note
**POST** `/papers/:id/notes`

**Request Body:**
```json
{
  "content": "My note content",
  "section": "Methods"
}
```

### Generate AI Note
**POST** `/papers/:id/ai-notes`

**Request Body:**
```json
{
  "section": "Methods",
  "prompt": "Explain this section as if I'm a beginner"
}
```

### Update Note
**PUT** `/notes/:id`

### Delete Note
**DELETE** `/notes/:id`

---

## Error Responses

All errors follow this format:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": ["Optional array of details"]
}
```

### Common Error Codes
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `DUPLICATE_ERROR` - Resource already exists
- `INTERNAL_SERVER_ERROR` - Server error
