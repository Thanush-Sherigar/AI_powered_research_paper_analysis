import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Novelty Service
 * Detects novelty and overlap between papers in a project
 */

/**
 * Analyze novelty across papers in a project
 * @param {Array<Object>} papers - Array of paper objects
 * @returns {Promise<Object>} Novelty analysis
 */
export const analyzeNovelty = async (papers) => {
    try {
        if (papers.length < 2) {
            throw new Error('At least 2 papers required for novelty analysis');
        }

        logger.info(`Analyzing novelty across ${papers.length} papers`);

        const llm = getLLMClient();
        const prompt = prompts.detectNovelty(papers);

        const analysis = await llm.generateJSON(prompt, {
            temperature: 0.5,
            maxTokens: 2500,
        });

        analysis.generatedAt = new Date();

        return analysis;
    } catch (error) {
        logger.error(`Novelty analysis error: ${error.message}`);
        throw error;
    }
};
