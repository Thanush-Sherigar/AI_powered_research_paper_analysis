import { getLLMClient } from './llmService.js';
import { truncateToTokenLimit } from '../utils/chunking.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Mind Map Service
 * Generates hierarchical mind maps for papers
 */

/**
 * Generate mind map from paper
 * @param {Object} paper - Paper object
 * @returns {Promise<Object>} Hierarchical mind map object
 */
export const generateMindMap = async (paper) => {
    try {
        logger.info(`Generating mind map for paper: ${paper.title}`);

        const llm = getLLMClient();
        // Truncate to ~12000 tokens
        const limitedText = truncateToTokenLimit(paper.cleanText, 12000);
        const prompt = prompts.generateMindMap(limitedText);

        const mindMap = await llm.generateJSON(prompt, {
            temperature: 0.5,
            maxTokens: 4000,
        });

        // Validate structure
        if (!mindMap.root || !Array.isArray(mindMap.children)) {
            throw new Error('Invalid mind map structure returned from LLM');
        }

        // Add metadata
        mindMap.paperId = paper._id;
        mindMap.generatedAt = new Date();

        return mindMap;
    } catch (error) {
        logger.error(`Mind map generation error: ${error.message}`);
        throw error;
    }
};
