import pdf from 'pdf-parse';
import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { countTokens, truncateToTokenLimit } from '../utils/chunking.js';
import { AppError } from '../middlewares/errorMiddleware.js';

/**
 * PDF Service
 * Handles PDF text extraction, section detection, and text cleaning
 */

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} Extracted data {text, numPages, info}
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);

        logger.info(`Extracted ${data.numpages} pages from PDF`);

        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    } catch (error) {
        logger.error(`PDF extraction error: ${error.message}`);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

/**
 * Detect and split paper into sections
 * Looks for common academic paper section headers
 * @param {string} text - Full paper text
 * @returns {Array<Object>} Array of {name, content} objects
 */
export const detectSections = (text) => {
    // Common section headers in academic papers
    const sectionPatterns = [
        /(?:^|\n)\s*(?:1\.?\s+)?(?:ABSTRACT|Abstract)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:INTRODUCTION|Introduction)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:RELATED WORK|Related Work|Background|BACKGROUND)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:METHODOLOGY|Methodology|METHOD|Method|APPROACH|Approach)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:EXPERIMENTS?|Experiments?|RESULTS?|Results?|EVALUATION|Evaluation)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:DISCUSSION|Discussion|ANALYSIS|Analysis)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:CONCLUSION|Conclusion|CONCLUSIONS|Conclusions)\s*(?:\n|$)/i,
        /(?:^|\n)\s*(?:\d+\.?\s+)?(?:REFERENCES?|References?|BIBLIOGRAPHY|Bibliography)\s*(?:\n|$)/i,
    ];

    const sections = [];
    const matches = [];

    // Find all section headers
    sectionPatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match) {
            matches.push({
                name: match[0].trim().replace(/^\d+\.?\s*/, ''),
                index: match.index,
            });
        }
    });

    // Sort by position in text
    matches.sort((a, b) => a.index - b.index);

    // Extract content between headers
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
        const content = text.substring(start, end).trim();

        // Remove the header from content
        const contentWithoutHeader = content.replace(matches[i].name, '').trim();

        if (contentWithoutHeader.length > 50) { // Only include substantial sections
            sections.push({
                name: matches[i].name,
                content: contentWithoutHeader,
            });
        }
    }

    // If no sections detected, treat entire text as one section
    if (sections.length === 0) {
        sections.push({
            name: 'Full Text',
            content: text,
        });
    }

    logger.info(`Detected ${sections.length} sections`);
    return sections;
};

/**
 * Clean and normalize text
 * Removes excessive whitespace, special characters, etc.
 * @param {string} text - Raw text
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
    let cleaned = text;

    // Remove excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Remove excessive spaces
    cleaned = cleaned.replace(/ {2,}/g, ' ');

    // Remove page numbers and headers/footers (common patterns)
    cleaned = cleaned.replace(/^\d+\s*$/gm, '');

    // Remove URLs (optional, might want to keep them)
    // cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');

    // Normalize unicode characters
    cleaned = cleaned.normalize('NFKC');

    // Trim
    cleaned = cleaned.trim();

    return cleaned;
};

/**
 * Extract metadata from paper text
 * Attempts to find title, authors, abstract, etc.
 * @param {string} text - Full paper text
 * @returns {Object} Metadata {title, authors, abstract, keywords}
 */
export const extractMetadata = (text) => {
    const metadata = {
        title: null,
        authors: [],
        abstract: null,
        keywords: [],
    };

    // Try to extract title (usually first substantial line)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
        // Title is often the first line or first few lines
        metadata.title = lines[0].trim();

        // If title is very short, might include next line
        if (metadata.title.length < 20 && lines.length > 1) {
            metadata.title += ' ' + lines[1].trim();
        }
    }

    // Try to extract abstract
    const abstractMatch = text.match(/(?:ABSTRACT|Abstract)\s*\n([\s\S]{100,2000}?)(?:\n\n|\n(?:1\.|INTRODUCTION|Introduction))/i);
    if (abstractMatch) {
        metadata.abstract = abstractMatch[1].trim();
    }

    // Try to extract keywords
    const keywordsMatch = text.match(/(?:KEYWORDS?|Keywords?)[:\s]+(.*?)(?:\n\n|\n(?:1\.|INTRODUCTION))/is);
    if (keywordsMatch) {
        metadata.keywords = keywordsMatch[1]
            .split(/[,;]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
    }

    return metadata;
};

/**
 * Process PDF file completely
 * Extracts text, detects sections, cleans text, and extracts metadata
 * @param {string} filePath - Path to PDF file
 * @param {number} maxTokens - Maximum tokens for cleaned text (for LLM context)
 * @returns {Promise<Object>} Processed paper data
 */
export const processPDF = async (filePath, maxTokens = 8000) => {
    // Extract text
    const { text, numPages, info } = await extractTextFromPDF(filePath);

    // Clean text
    const cleanedText = cleanText(text);

    if (!cleanedText || cleanedText.length < 50) {
        throw new AppError('Unable to extract text from PDF. The file might be a scanned image or contain no selectable text.', 400, 'PDF_NO_TEXT');
    }

    // Detect sections
    const sections = detectSections(cleanedText);

    // Extract metadata
    const metadata = extractMetadata(cleanedText);

    // Create token-limited version for LLM
    const limitedText = truncateToTokenLimit(cleanedText, maxTokens);

    // Count tokens and words
    const tokenCount = countTokens(cleanedText);
    const wordCount = cleanedText.split(/\s+/).length;

    logger.success(`Processed PDF: ${numPages} pages, ${wordCount} words, ${tokenCount} tokens`);

    return {
        rawText: text,
        cleanText: limitedText,
        fullCleanText: cleanedText, // Keep full version for embeddings
        sections,
        metadata: {
            ...metadata,
            pageCount: numPages,
            wordCount,
            tokenCount,
            pdfInfo: info,
        },
    };
};
