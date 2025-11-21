import { getLLMClient } from './llmService.js';
import { truncateToTokenLimit } from '../utils/chunking.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Review Service
 * Generates conference-style peer reviews for research papers
 */

/**
 * Generate conference-style review
 * @param {Object} paper - Paper object with cleanText
 * @returns {Promise<Object>} Review object with structured feedback
 */
export const generateReview = async (paper) => {
    try {
        logger.info(`Generating review for paper: ${paper.title}`);

        const llm = getLLMClient();
        // Truncate to ~12000 tokens (approx 48k chars) for review - we need more context than summary
        const limitedText = truncateToTokenLimit(paper.cleanText, 12000);
        logger.debug(`Original text length: ${paper.cleanText.length}, Truncated length: ${limitedText.length}`);

        const prompt = prompts.conferenceReview(limitedText);

        // Use generateJSON for reliable structured output
        const review = await llm.generateJSON(prompt, {
            temperature: 0.7,
            maxTokens: 4000,
            systemMessage: 'You are an expert peer reviewer. Always respond with valid JSON.',
        });

        return review;
    } catch (error) {
        logger.error(`Review generation error: ${error.message}`);
        throw error;
    }
};
