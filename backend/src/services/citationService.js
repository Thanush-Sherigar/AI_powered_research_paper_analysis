import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Citation Service
 * Checks citation quality and flags risky claims
 */

/**
 * Check citations in user's draft text
 * @param {string} userText - User's draft text with citations
 * @param {Array<Object>} papers - Referenced papers
 * @returns {Promise<Object>} Citation check results
 */
export const checkCitations = async (userText, papers) => {
    try {
        logger.info('Checking citation quality');

        const llm = getLLMClient();
        const prompt = prompts.checkCitations(userText, papers);

        const results = await llm.generateJSON(prompt, {
            temperature: 0.5,
            maxTokens: 2000,
        });

        results.generatedAt = new Date();

        return results;
    } catch (error) {
        logger.error(`Citation check error: ${error.message}`);
        throw error;
    }
};
