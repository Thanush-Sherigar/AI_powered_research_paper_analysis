import { getLLMClient } from './llmService.js';
import { truncateToTokenLimit } from '../utils/chunking.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Summary Service
 * Generates different types of summaries for research papers
 */

/**
 * Generate TL;DR summary
 * @param {Object} paper - Paper object with cleanText
 * @returns {Promise<string>} TL;DR summary
 */
export const generateTLDR = async (paper) => {
    try {
        logger.info(`Generating TL;DR for paper: ${paper.title}`);

        const llm = getLLMClient();
        // Truncate to ~4000 tokens (approx 16k chars) for faster processing
        // TL;DR usually only needs abstract and intro
        const limitedText = truncateToTokenLimit(paper.cleanText, 4000);
        logger.debug(`Original text length: ${paper.cleanText.length}, Truncated length: ${limitedText.length}`);
        const prompt = prompts.tldrSummary(limitedText);

        const summary = await llm.generate(prompt, {
            temperature: 0.5,
            maxTokens: 1000,
        });

        return summary.trim();
    } catch (error) {
        logger.error(`TL;DR generation error: ${error.message}`);
        throw error;
    }
};

/**
 * Generate paragraph executive summary
 * @param {Object} paper - Paper object with cleanText
 * @returns {Promise<string>} Executive summary
 */
export const generateParagraphSummary = async (paper) => {
    try {
        logger.info(`Generating paragraph summary for paper: ${paper.title}`);

        const llm = getLLMClient();
        // Truncate to ~4000 tokens for faster processing
        const limitedText = truncateToTokenLimit(paper.cleanText, 4000);
        logger.debug(`Original text length: ${paper.cleanText.length}, Truncated length: ${limitedText.length}`);
        const prompt = prompts.paragraphSummary(limitedText);

        const summary = await llm.generate(prompt, {
            temperature: 0.5,
            maxTokens: 1000,
        });

        return summary.trim();
    } catch (error) {
        logger.error(`Paragraph summary generation error: ${error.message}`);
        throw error;
    }
};

/**
 * Generate detailed section-wise summary
 * @param {Object} paper - Paper object with sections
 * @returns {Promise<string>} Detailed summary
 */
export const generateDetailedSummary = async (paper) => {
    try {
        logger.info(`Generating detailed summary for paper: ${paper.title}`);

        const llm = getLLMClient();
        const prompt = prompts.detailedSummary(paper.cleanText, paper.sections);

        const summary = await llm.generate(prompt, {
            temperature: 0.5,
            maxTokens: 2000,
        });

        return summary.trim();
    } catch (error) {
        logger.error(`Detailed summary generation error: ${error.message}`);
        throw error;
    }
};

/**
 * Generate summary based on mode
 * @param {Object} paper - Paper object
 * @param {string} mode - 'tldr', 'paragraph', or 'detailed'
 * @returns {Promise<string>} Summary
 */
export const generateSummary = async (paper, mode = 'tldr') => {
    switch (mode) {
        case 'tldr':
            return await generateTLDR(paper);
        case 'paragraph':
            return await generateParagraphSummary(paper);
        case 'detailed':
            return await generateDetailedSummary(paper);
        default:
            throw new Error(`Unknown summary mode: ${mode}`);
    }
};
