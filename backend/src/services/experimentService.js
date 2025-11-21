import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Experiment Service
 * Suggests experiments and future work based on papers and user ideas
 */

/**
 * Suggest experiments based on paper and user idea
 * @param {Object} paper - Paper object
 * @param {string} userIdea - User's project idea
 * @returns {Promise<Object>} Experiment suggestions
 */
export const suggestExperiments = async (paper, userIdea) => {
    try {
        logger.info(`Suggesting experiments for user idea based on: ${paper.title}`);

        const llm = getLLMClient();
        const prompt = prompts.suggestExperiments(paper.cleanText, userIdea);

        const suggestions = await llm.generate(prompt, {
            temperature: 0.7,
            maxTokens: 2000,
        });

        return {
            paperId: paper._id,
            paperTitle: paper.title,
            userIdea,
            suggestions,
            generatedAt: new Date(),
        };
    } catch (error) {
        logger.error(`Experiment suggestion error: ${error.message}`);
        throw error;
    }
};
