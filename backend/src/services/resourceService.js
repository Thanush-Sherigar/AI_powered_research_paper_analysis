import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Resource Service
 * Detects datasets, code repositories, and reproducibility resources
 */

/**
 * Extract resources from paper
 * @param {Object} paper - Paper object
 * @returns {Promise<Object>} Resources summary
 */
export const extractResources = async (paper) => {
    try {
        logger.info(`Extracting resources from paper: ${paper.title}`);

        const llm = getLLMClient();
        const prompt = prompts.detectResources(paper.cleanText);

        const resources = await llm.generateJSON(prompt, {
            temperature: 0.5,
            maxTokens: 1500,
        });

        resources.paperId = paper._id;
        resources.paperTitle = paper.title;
        resources.generatedAt = new Date();

        return resources;
    } catch (error) {
        logger.error(`Resource extraction error: ${error.message}`);
        throw error;
    }
};
