import { getEmbeddingClient, cosineSimilarity } from './embeddingService.js';
import EmbeddingChunk from '../models/EmbeddingChunk.js';
import logger from '../utils/logger.js';

/**
 * Search Service
 * Provides semantic search across papers using embeddings
 */

/**
 * Semantic search across user's papers
 * @param {string} query - Search query
 * @param {string} projectId - Project ID to search within
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} Search results with scores
 */
export const semanticSearch = async (query, projectId, topK = 5) => {
    try {
        logger.info(`Performing semantic search for: "${query}"`);

        // Generate embedding for query
        const embeddingClient = getEmbeddingClient();
        const queryEmbedding = await embeddingClient.embed(query);

        // Get all chunks for this project
        const chunks = await EmbeddingChunk.find({ projectId })
            .populate('paperId', 'title authors')
            .lean();

        if (chunks.length === 0) {
            return [];
        }

        // Calculate similarity scores
        const results = chunks.map(chunk => ({
            ...chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        // Sort by similarity and take top K
        results.sort((a, b) => b.similarity - a.similarity);
        const topResults = results.slice(0, topK);

        logger.success(`Found ${topResults.length} relevant chunks`);

        return topResults.map(r => ({
            paperId: r.paperId._id,
            paperTitle: r.paperId.title,
            section: r.section,
            text: r.text,
            similarity: r.similarity,
        }));
    } catch (error) {
        logger.error(`Semantic search error: ${error.message}`);
        throw error;
    }
};
