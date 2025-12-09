import fs from 'fs/promises';
import { checkWeb, checkInternal, checkHumanism } from '../services/plagiarismService.js';
import { processPDF } from '../services/pdfService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

/**
 * Check for plagiarism (Web Search)
 * POST /api/plagiarism/check-web
 * Body: { text }
 */
export const checkWebPlagiarism = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text) {
            throw new AppError('Text is required', 400, 'INVALID_INPUT');
        }

        const result = await checkWeb(text);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Check for similarity (Internal Vector Search)
 * POST /api/plagiarism/check-internal
 * Body: { text, projectId }
 */
export const checkInternalSimilarity = async (req, res, next) => {
    try {
        const { text, projectId } = req.body;

        if (!text || !projectId) {
            throw new AppError('Text and projectId are required', 400, 'INVALID_INPUT');
        }

        const result = await checkInternal(text, projectId);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Check Project Report (File Upload)
 * POST /api/plagiarism/check-file
 * Multipart Form: file, projectId
 */
export const checkFileReport = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No report file uploaded', 400, 'NO_FILE');
        }

        const { projectId } = req.body;

        // 1. Extract text from PDF
        const processed = await processPDF(req.file.path);
        const text = processed.cleanText;

        // Clean up file immediately after extraction
        await fs.unlink(req.file.path).catch(() => { });

        if (!text || text.length < 100) {
            throw new AppError('Extracted text is too short quality analysis', 400, 'TEXT_TOO_SHORT');
        }

        // 2. Run Checks in Parallel
        const [webResult, humanismResult] = await Promise.all([
            checkWeb(text),
            checkHumanism(text)
        ]);

        res.json({
            fileInfo: {
                name: req.file.originalname,
                wordCount: processed.metadata.wordCount,
                pageCount: processed.metadata.pageCount
            },
            web: webResult,
            humanism: humanismResult
        });

    } catch (error) {
        // Ensure file is deleted on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};

/**
 * Check for AI content (Humanism Score)
 * POST /api/plagiarism/check-humanism
 * Body: { text }
 */
export const checkHumanismScore = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            throw new AppError('Text is required', 400, 'INVALID_INPUT');
        }
        const result = await checkHumanism(text);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
