import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Reading Path Service
 * Generates ordered reading paths based on user topic and level
 */

/**
 * Generate reading path recommendation
 * @param {Array<Object>} papers - Array of paper objects
 * @param {string} topic - Topic of interest
 * @param {string} level - User level (beginner/intermediate/advanced)
 * @returns {Promise<Object>} Reading path
 */
export const generateReadingPath = async (papers, topic, level = 'intermediate') => {
    try {
        if (papers.length === 0) {
            throw new Error('No papers available for reading path');
        }

        logger.info(`Generating reading path for topic: ${topic}, level: ${level}`);

        const llm = getLLMClient();
        const prompt = prompts.generateReadingPath(papers, topic, level);

        const pathData = await llm.generateJSON(prompt, {
            temperature: 0.6,
            maxTokens: 2000,
        });

        return {
            topic,
            level,
            path: pathData,
            generatedAt: new Date(),
        };
    } catch (error) {
        logger.error(`Reading path generation error: ${error.message}`);
        throw error;
    }
};
