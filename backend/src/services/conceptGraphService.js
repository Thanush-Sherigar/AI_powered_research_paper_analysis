import { getLLMClient } from './llmService.js';
import { truncateToTokenLimit } from '../utils/chunking.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Concept Graph Service
 * Extracts concepts and relationships from papers to build knowledge graphs
 */

/**
 * Extract concept graph from paper
 * @param {Object} paper - Paper object
 * @returns {Promise<Object>} Graph with nodes and edges
 */
export const extractConceptGraph = async (paper) => {
    try {
        logger.info(`Extracting concept graph for paper: ${paper.title}`);

        const llm = getLLMClient();
        // Truncate to ~12000 tokens for graph extraction
        const limitedText = truncateToTokenLimit(paper.cleanText, 12000);
        const prompt = prompts.extractConcepts(limitedText);

        const graph = await llm.generateJSON(prompt, {
            temperature: 0.5,
            maxTokens: 8000,
        });

        // Validate graph structure
        if (!graph.nodes || !graph.edges) {
            throw new Error('Invalid graph structure returned from LLM');
        }

        // Add paper metadata
        graph.paperId = paper._id;
        graph.paperTitle = paper.title;
        graph.generatedAt = new Date();

        logger.success(`Extracted ${graph.nodes.length} nodes and ${graph.edges.length} edges`);

        return graph;
    } catch (error) {
        logger.error(`Concept graph extraction error: ${error.message}`);
        throw error;
    }
};
