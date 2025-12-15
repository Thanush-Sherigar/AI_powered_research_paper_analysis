import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Ethics Service
 * Analyzes papers for potential ethical issues and biases
 */

/**
 * Check paper for ethical issues
 * @param {Object} paper - Paper object
 * @returns {Promise<Object>} Ethical analysis
 */
export const checkEthics = async (paper, mode = 'detailed') => {
    try {
        logger.info(`Checking ethics for paper: ${paper._id}, mode: ${mode}`);

        const llm = getLLMClient();
        // Use first 15000 chars to cover abstract, intro, data, methods
        const textToAnalyze = paper.cleanText ? paper.cleanText.substring(0, 15000) : "No text available";

        const prompt = mode === 'summary'
            ? prompts.checkBiasAndEthicsSummary(textToAnalyze)
            : prompts.checkBiasAndEthics(textToAnalyze);

        const analysis = await llm.generateJSON(prompt, {
            temperature: 0.3,
            maxTokens: mode === 'summary' ? 500 : 2000,
        });

        analysis.generatedAt = new Date();

        return analysis;
    } catch (error) {
        logger.error(`Ethics check error: ${error.message}`);
        throw error;
    }
};
