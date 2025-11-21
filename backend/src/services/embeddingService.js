import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Abstract Embedding Client class
 * Provides interface for swappable embedding providers
 */
class EmbeddingClient {
    /**
     * Generate embeddings for text(s)
     * @param {string|Array<string>} texts - Single text or array of texts
     * @returns {Promise<Array<number>|Array<Array<number>>>} Embedding(s)
     */
    async embed(texts) {
        throw new Error('embed() must be implemented by subclass');
    }

    /**
     * Get embedding dimensions
     * @returns {number} Dimension count
     */
    getDimensions() {
        throw new Error('getDimensions() must be implemented by subclass');
    }
}

/**
 * OpenAI Embedding Client implementation
 */
class OpenAIEmbeddingClient extends EmbeddingClient {
    constructor(apiKey, model = 'text-embedding-3-small') {
        super();
        this.client = new OpenAI({ apiKey });
        this.model = model;
        this.dimensions = config.embedding.dimensions;
    }

    async embed(texts) {
        try {
            const isArray = Array.isArray(texts);
            const input = isArray ? texts : [texts];

            // OpenAI has a limit on batch size, process in chunks if needed
            const batchSize = 100;
            const allEmbeddings = [];

            for (let i = 0; i < input.length; i += batchSize) {
                const batch = input.slice(i, i + batchSize);

                const response = await this.client.embeddings.create({
                    model: this.model,
                    input: batch,
                });

                const embeddings = response.data.map(item => item.embedding);
                allEmbeddings.push(...embeddings);
            }

            return isArray ? allEmbeddings : allEmbeddings[0];
        } catch (error) {
            logger.error(`OpenAI embedding error: ${error.message}`);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    getDimensions() {
        return this.dimensions;
    }
}

/**
 * Gemini Embedding Client implementation
 */
class GeminiEmbeddingClient extends EmbeddingClient {
    constructor(apiKey, model = 'text-embedding-004') {
        super();
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model });
        this.dimensions = 768; // Default for text-embedding-004
    }

    async embed(texts) {
        try {
            const isArray = Array.isArray(texts);
            const input = isArray ? texts : [texts];

            const allEmbeddings = [];

            // Gemini currently processes one by one or in small batches
            // We'll process one by one with a delay to avoid rate limits
            for (const text of input) {
                const result = await this.model.embedContent(text);
                const embedding = result.embedding;
                allEmbeddings.push(embedding.values);

                // Add a small delay to avoid hitting rate limits (e.g., 60 requests per minute)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return isArray ? allEmbeddings : allEmbeddings[0];
        } catch (error) {
            logger.error(`Gemini embedding error: ${error.message}`);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    getDimensions() {
        return this.dimensions;
    }
}

/**
 * Local Embedding Client implementation (placeholder)
 * This would use a local embedding model (e.g., sentence-transformers via Python microservice)
 */
class LocalEmbeddingClient extends EmbeddingClient {
    constructor(baseURL = 'http://localhost:8000', model = 'all-MiniLM-L6-v2') {
        super();
        this.baseURL = baseURL;
        this.model = model;
        this.dimensions = 384; // Default for all-MiniLM-L6-v2
    }

    async embed(texts) {
        // Placeholder implementation
        // In production, this would make HTTP requests to your local embedding server
        throw new Error('Local embedding client not yet implemented. Please use OpenAI provider.');

        /* Example implementation for a Python microservice:
        const response = await fetch(`${this.baseURL}/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: Array.isArray(texts) ? texts : [texts],
            model: this.model,
          }),
        });
        const data = await response.json();
        return Array.isArray(texts) ? data.embeddings : data.embeddings[0];
        */
    }

    getDimensions() {
        return this.dimensions;
    }
}

/**
 * Factory function to get configured embedding client
 * @returns {EmbeddingClient} Configured embedding client instance
 */
export const getEmbeddingClient = () => {
    const provider = config.embedding.provider;

    switch (provider) {
        case 'openai':
            if (!config.openai.apiKey) {
                throw new Error('OpenAI API key not configured');
            }
            return new OpenAIEmbeddingClient(config.openai.apiKey, config.embedding.model);

        case 'gemini':
            if (!config.gemini.apiKey) {
                throw new Error('Gemini API key not configured');
            }
            return new GeminiEmbeddingClient(config.gemini.apiKey, config.embedding.model || 'text-embedding-004');

        case 'local':
            return new LocalEmbeddingClient();

        default:
            throw new Error(`Unknown embedding provider: ${provider}`);
    }
};

/**
 * Helper function to generate embeddings for paper chunks
 * @param {Array<Object>} chunks - Array of {section, text} objects
 * @returns {Promise<Array<Object>>} Chunks with embeddings added
 */
export const embedChunks = async (chunks) => {
    const client = getEmbeddingClient();
    const texts = chunks.map(chunk => chunk.text);

    logger.info(`Generating embeddings for ${texts.length} chunks...`);
    const embeddings = await client.embed(texts);

    return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index],
    }));
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array<number>} a - First vector
 * @param {Array<number>} b - Second vector
 * @returns {number} Cosine similarity (-1 to 1)
 */
export const cosineSimilarity = (a, b) => {
    if (a.length !== b.length) {
        throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Export classes for testing or direct use
export { EmbeddingClient, OpenAIEmbeddingClient, LocalEmbeddingClient, GeminiEmbeddingClient };
