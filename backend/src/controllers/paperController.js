import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import Paper from '../models/Paper.js';
import Project from '../models/Project.js';
import EmbeddingChunk from '../models/EmbeddingChunk.js';
import { processPDF } from '../services/pdfService.js';
import { embedChunks } from '../services/embeddingService.js';
import { chunkBySections } from '../utils/chunking.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Paper Controller
 * Handles paper upload, ingestion, and management
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = config.upload.uploadDir;
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: config.upload.maxFileSize },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

export const uploadMiddleware = upload.single('file');

/**
 * Upload and process PDF
 * POST /api/papers/upload
 */
export const uploadPaper = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded', 400, 'NO_FILE');
        }

        const { projectId } = req.body;

        if (!projectId) {
            // Clean up uploaded file
            await fs.unlink(req.file.path);
            throw new AppError('Project ID is required', 400, 'MISSING_PROJECT_ID');
        }

        // Verify project ownership
        const project = await Project.findById(projectId);
        if (!project) {
            await fs.unlink(req.file.path);
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        if (project.userId.toString() !== req.user.id) {
            await fs.unlink(req.file.path);
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Process PDF
        logger.info(`Processing PDF: ${req.file.originalname}`);
        const processed = await processPDF(req.file.path);

        // Create paper document
        const paper = new Paper({
            projectId,
            title: processed.metadata.title || req.file.originalname.replace('.pdf', ''),
            authors: processed.metadata.authors || [],
            abstract: processed.metadata.abstract,
            keywords: processed.metadata.keywords || [],
            sourceType: 'upload',
            sections: processed.sections,
            rawText: processed.rawText,
            cleanText: processed.cleanText,
            metadata: {
                ...processed.metadata,
                uploadedFileName: req.file.originalname,
            },
        });

        await paper.save();

        // Add paper to project
        project.papers.push(paper._id);
        project.metadata.paperCount = project.papers.length;
        await project.save();

        // Generate and store embeddings
        logger.info('Generating embeddings...');
        const chunks = chunkBySections(processed.sections, 500);
        const chunksWithEmbeddings = await embedChunks(chunks);

        const embeddingDocs = chunksWithEmbeddings.map(chunk => ({
            paperId: paper._id,
            projectId,
            section: chunk.section,
            text: chunk.text,
            embedding: chunk.embedding,
            chunkIndex: chunk.chunkIndex,
            metadata: {
                charCount: chunk.text.length,
            },
        }));

        await EmbeddingChunk.insertMany(embeddingDocs);

        logger.success(`Paper uploaded and processed: ${paper.title}`);

        res.status(201).json({
            message: 'Paper uploaded and processed successfully',
            paper,
        });
    } catch (error) {
        // Clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};

/**
 * Add paper by DOI/arXiv (stub)
 * POST /api/papers/add-by-doi
 */
export const addByDOI = async (req, res, next) => {
    try {
        const { projectId, doi, arxivId, url } = req.body;

        // Verify project ownership
        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // This is a stub - in production, you would:
        // 1. Fetch paper metadata from DOI/arXiv API
        // 2. Download PDF if available
        // 3. Process like uploaded PDF

        throw new AppError('DOI/arXiv ingestion not yet implemented', 501, 'NOT_IMPLEMENTED');
    } catch (error) {
        next(error);
    }
};

/**
 * Get paper by ID
 * GET /api/papers/:id
 */
export const getPaper = async (req, res, next) => {
    try {
        const paper = await Paper.findById(req.params.id)
            .populate('projectId', 'name userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        res.json(paper);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete paper
 * DELETE /api/papers/:id
 */
export const deletePaper = async (req, res, next) => {
    try {
        const paper = await Paper.findById(req.params.id)
            .populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Delete embeddings
        await EmbeddingChunk.deleteMany({ paperId: paper._id });

        // Remove from project
        await Project.findByIdAndUpdate(paper.projectId._id, {
            $pull: { papers: paper._id },
        });

        // Delete paper
        await paper.deleteOne();

        logger.info(`Paper deleted: ${paper.title}`);

        res.json({
            message: 'Paper deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
