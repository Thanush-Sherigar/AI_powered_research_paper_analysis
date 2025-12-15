import { getLLMClient } from './llmService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Comparison Service
 * Compares multiple research papers
 */

/**
 * Compare 2-5 papers
 * @param {Array<Object>} papers - Array of paper objects
 * @returns {Promise<Object>} Comparison result
 */
export const comparePapers = async (papers) => {
  try {
    if (papers.length < 2) {
      throw new Error('At least 2 papers required for comparison');
    }

    if (papers.length > 5) {
      throw new Error('Maximum 5 papers can be compared at once');
    }

    logger.info(`Comparing ${papers.length} papers`);

    const llm = getLLMClient();
    const prompt = prompts.comparePapers(papers);

    const comparisonText = await llm.generate(prompt, {
      temperature: 0.7,
      maxTokens: 3000,
    });

    return {
      papers: papers.map(p => ({ id: p._id, title: p.title })),
      comparison: comparisonText,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error(`Paper comparison error: ${error.message}`);
    throw error;
  }
};

/**
 * Compare two versions of a paper
 * @param {Object} oldPaper - Old version paper object
 * @param {Object} newPaper - New version paper object
 * @returns {Promise<Object>} Comparison result
 */
export const compareVersions = async (oldPaper, newPaper) => {
  try {
    logger.info(`Comparing versions: ${oldPaper._id} vs ${newPaper._id}`);

    const llm = getLLMClient();
    const prompt = prompts.compareVersions(oldPaper, newPaper);

    const comparisonText = await llm.generate(prompt, {
      temperature: 0.5,
      maxTokens: 3000,
    });

    return {
      oldPaperId: oldPaper._id,
      newPaperId: newPaper._id,
      comparison: comparisonText,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error(`Version comparison error: ${error.message}`);
    throw error;
  }
};
