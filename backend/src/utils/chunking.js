/**
 * Text chunking utilities for embeddings
 * Provides functions to split text into manageable chunks for embedding generation
 */

/**
 * Simple token counter (approximation)
 * Roughly 1 token = 4 characters for English text
 * @param {string} text - Text to count tokens for
 * @returns {number} Approximate token count
 */
export const countTokens = (text) => {
    return Math.ceil(text.length / 4);
};

/**
 * Split text into chunks by character count
 * @param {string} text - Text to split
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {Array<string>} Array of text chunks
 */
export const chunkByCharacters = (text, maxChunkSize = 1000, overlap = 200) => {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + maxChunkSize, text.length);
        chunks.push(text.slice(start, end));
        start = end - overlap;

        // Prevent infinite loop
        if (start >= text.length) break;
    }

    return chunks;
};

/**
 * Split text into chunks by sentences
 * Tries to keep chunks under maxTokens while preserving sentence boundaries
 * @param {string} text - Text to split
 * @param {number} maxTokens - Maximum tokens per chunk
 * @returns {Array<string>} Array of text chunks
 */
export const chunkBySentences = (text, maxTokens = 500) => {
    // Split by sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        const testChunk = currentChunk + ' ' + sentence;

        if (countTokens(testChunk) > maxTokens && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk = testChunk;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};

/**
 * Split text by sections
 * Useful for academic papers with clear section headers
 * @param {Array<Object>} sections - Array of {name, content} objects
 * @param {number} maxTokens - Maximum tokens per chunk
 * @returns {Array<Object>} Array of {section, text, chunkIndex} objects
 */
export const chunkBySections = (sections, maxTokens = 500) => {
    const chunks = [];

    for (const section of sections) {
        const sectionChunks = chunkBySentences(section.content, maxTokens);

        sectionChunks.forEach((chunk, index) => {
            chunks.push({
                section: section.name,
                text: chunk,
                chunkIndex: index,
            });
        });
    }

    return chunks;
};

/**
 * Truncate text to fit within token limit
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Maximum tokens allowed
 * @returns {string} Truncated text
 */
export const truncateToTokenLimit = (text, maxTokens) => {
    const maxChars = maxTokens * 4; // Approximate conversion

    if (text.length <= maxChars) {
        return text;
    }

    // Try to truncate at sentence boundary
    const truncated = text.slice(0, maxChars);
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > maxChars * 0.8) {
        return truncated.slice(0, lastPeriod + 1);
    }

    return truncated + '...';
};
