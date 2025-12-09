import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules don't have __dirname, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Centralized configuration object
 * All environment variables are accessed through this module
 */
const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/paper_reviewer',
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // Gemini
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  // LLM Configuration
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    model: process.env.LLM_MODEL || 'gemini-2.0-flash',
  },

  // Embedding Configuration
  embedding: {
    provider: process.env.EMBEDDING_PROVIDER || 'openai',
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },

  // Google Search (Plagiarism)
  googleSearch: {
    apiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
  },
};

// Validate critical configuration
if (!config.openai.apiKey && config.llm.provider === 'openai') {
  console.warn('⚠️  WARNING: OPENAI_API_KEY is not set. LLM features will not work.');
}

if (!config.gemini.apiKey && config.llm.provider === 'gemini') {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. LLM features will not work.');
}

export default config;
