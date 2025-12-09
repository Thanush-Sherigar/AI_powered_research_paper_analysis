import axios from 'axios';
import { getEmbeddingClient } from './embeddingService.js';
import { getLLMClient } from './llmService.js';
import EmbeddingChunk from '../models/EmbeddingChunk.js';
import Paper from '../models/Paper.js';
import logger from '../utils/logger.js';

import config from '../config/index.js';

/**
 * Plagiarism Service
 * Handles Web Plagiarism (Google Search) and Internal Similarity (Vector Search)
 */

const GOOGLE_API_KEY = config.googleSearch.apiKey;
const GOOGLE_CX = config.googleSearch.searchEngineId;

/**
 * Check text against the web using Google Custom Search
 * @param {string} text - Text to check
 * @returns {Promise<Object>} Web check results
 */
export const checkWeb = async (text) => {
    try {
        if (!text || text.length < 50) {
            throw new Error('Text too short for web check (min 50 chars)');
        }

        if (!GOOGLE_API_KEY || !GOOGLE_CX) {
            logger.warn('Google Search API keys missing');
            throw new Error('Web plagiarism check not configured (API keys missing)');
        }

        // Strategy: Extract 3 random 10-15 word chunks and search for them
        const chunks = extractRandomChunks(text, 3, 10);
        const results = [];

        for (const chunk of chunks) {
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q="${encodeURIComponent(chunk)}"`;

            try {
                const response = await axios.get(searchUrl);
                const items = response.data.items || [];

                if (items.length > 0) {
                    results.push({
                        chunk,
                        matches: items.slice(0, 3).map(item => ({
                            title: item.title,
                            link: item.link,
                            snippet: item.snippet
                        }))
                    });
                }
            } catch (err) {
                logger.error(`Google Search error for chunk "${chunk}": ${err.message}`);
                if (err.response && err.response.status === 429) {
                    throw new Error('Google Search API quota exceeded');
                }
            }
        }

        return {
            source: 'web',
            foundMatches: results.length > 0,
            matches: results,
            checkedChunks: chunks.length
        };

    } catch (error) {
        logger.error(`Web plagiarism check failed: ${error.message}`);
        throw error;
    }
};

/**
 * Check text against internal papers in a project
 * @param {string} text - Text to check
 * @param {string} projectId - Project ID to check against
 * @returns {Promise<Object>} Internal check results
 */
export const checkInternal = async (text, projectId) => {
    try {
        if (!text || !projectId) {
            throw new Error('Text and projectId required');
        }

        // Generate embedding for the query text
        const client = getEmbeddingClient();
        const vector = await client.embed(text);

        // Search for similar chunks in the project
        // We use a lower similarity threshold (e.g., 0.85) to catch high similarity
        const similarChunks = await EmbeddingChunk.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'vector',
                    queryVector: vector,
                    numCandidates: 50,
                    limit: 10
                }
            },
            {
                $lookup: {
                    from: 'papers',
                    localField: 'paperId',
                    foreignField: '_id',
                    as: 'paper'
                }
            },
            {
                $unwind: '$paper'
            },
            {
                $match: {
                    'paper.projectId': projectId
                }
            },
            {
                $project: {
                    text: 1,
                    similarity: { $meta: 'vectorSearchScore' },
                    paperTitle: '$paper.title',
                    paperId: '$paper._id'
                }
            },
            {
                $match: {
                    similarity: { $gt: 0.85 } // Filter for high similarity
                }
            }
        ]);

        return {
            source: 'internal',
            foundMatches: similarChunks.length > 0,
            matches: similarChunks.map(chunk => ({
                text: chunk.text,
                similarity: chunk.similarity,
                sourcePaper: chunk.paperTitle,
                paperId: chunk.paperId
            }))
        };

    } catch (error) {
        logger.error(`Internal similarity check failed: ${error.message}`);
        throw error;
    }
};

/**
 * Check for Humanism (AI Detection)
 * Uses LLM to analyze text for AI-generated patterns
 * @param {string} text - Text to check
 * @returns {Promise<Object>} Humanism check results
 */
export const checkHumanism = async (text) => {
    try {
        if (!text || text.length < 100) {
            throw new Error('Text too short for humanism check (min 100 chars)');
        }

        const llm = getLLMClient();

        // We take a sample of the text if it's too long to save tokens/time
        // Taking middle-ish chunk usually works well, or just the first few paragraphs
        const sampleText = text.length > 4000 ? text.substring(0, 4000) : text;

        const prompt = `
        Analyze the following text for signs of being AI-generated versus human-written. 
        Focus on:
        1. Perplexity/Burstiness (sentence structure variety)
        2. Repetitiveness (phrases, transition words)
        3. Depth of nuance and personal voice
        4. "Hallucination" style confident but vague assertions

        Text Sample:
        """
        ${sampleText}
        """

        Provide a "Humanism Score" from 0 to 100, where:
        - 0-20% = Highly likely AI-generated
        - 21-50% = Likely AI-assisted or mixed
        - 51-80% = Likely Human-written with some formal structure
        - 81-100% = Highly likely Human-written (nuanced, varied, imperfect)

        Return valid JSON in this format:
        {
            "humanismScore": number, // 0-100
            "assessment": "AI-generated" | "Mixed" | "Human-written",
            "confidence": number, // 0-100 indicating how sure you are
            "reasoning": "Brief explanation of why"
        }
        `;

        const result = await llm.generateJSON(prompt, { temperature: 0.1 });

        return {
            source: 'humanism',
            ...result
        };

    } catch (error) {
        logger.error(`Humanism check failed: ${error.message}`);
        // Fallback for demo purposes if LLM fails
        return {
            source: 'humanism',
            humanismScore: 50,
            assessment: 'Unknown',
            confidence: 0,
            reasoning: 'Analysis failed due to service error.'
        };
    }
};

/**
 * Helper: Extract random chunks of words from text
 */
const extractRandomChunks = (text, count, wordCount) => {
    const words = text.split(/\s+/);
    if (words.length <= wordCount) return [text];

    const chunks = [];
    for (let i = 0; i < count; i++) {
        // Random start index
        const maxStart = words.length - wordCount;
        const start = Math.floor(Math.random() * maxStart);
        const chunk = words.slice(start, start + wordCount).join(' ');
        chunks.push(chunk);
    }
    return chunks;
};
