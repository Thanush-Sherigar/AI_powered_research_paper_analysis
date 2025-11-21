import { getLLMClient } from './llmService.js';
import { semanticSearch } from './searchService.js';
import prompts from '../prompts/index.js';
import logger from '../utils/logger.js';

/**
 * Q&A Service
 * Answers questions about papers using RAG (Retrieval-Augmented Generation)
 */

/**
 * Answer a question about papers
 * @param {string} question - User's question
 * @param {string} projectId - Project ID to search within
 * @param {string} paperId - Optional specific paper ID
 * @returns {Promise<Object>} Answer with citations
 */
export const answerQuestion = async (question, projectId, paperId = null) => {
    try {
        logger.info(`Answering question: "${question}"`);

        // Retrieve relevant chunks using semantic search
        const relevantChunks = await semanticSearch(question, projectId, 5);

        if (relevantChunks.length === 0) {
            return {
                answer: 'I could not find relevant information in the uploaded papers to answer this question.',
                citations: [],
                confidence: 'low',
            };
        }

        // If specific paper requested, filter chunks
        let chunks = relevantChunks;
        if (paperId) {
            chunks = relevantChunks.filter(c => c.paperId.toString() === paperId);
        }

        // Generate answer using LLM with retrieved context
        const llm = getLLMClient();
        const prompt = prompts.answerQuestion(question, chunks);

        const response = await llm.generate(prompt, {
            temperature: 0.5,
            maxTokens: 1000,
        });

        // Extract answer and evidence
        const answerMatch = response.match(/\*\*Answer\*\*:?\s*([\s\S]*?)(?=\*\*Supporting Evidence\*\*|$)/i);
        const evidenceMatch = response.match(/\*\*Supporting Evidence\*\*:?\s*([\s\S]*?)$/i);

        return {
            answer: answerMatch ? answerMatch[1].trim() : response,
            supportingEvidence: evidenceMatch ? evidenceMatch[1].trim() : '',
            citations: chunks.map((c, i) => ({
                index: i + 1,
                paperId: c.paperId,
                paperTitle: c.paperTitle,
                section: c.section,
                text: c.text.substring(0, 200) + '...',
            })),
            confidence: chunks[0].similarity > 0.8 ? 'high' : chunks[0].similarity > 0.6 ? 'medium' : 'low',
        };
    } catch (error) {
        logger.error(`Q&A error: ${error.message}`);
        throw error;
    }
};
