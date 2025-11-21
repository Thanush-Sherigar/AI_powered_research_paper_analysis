import Note from '../models/Note.js';
import Paper from '../models/Paper.js';
import { getLLMClient } from '../services/llmService.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Notes Controller
 * Handles CRUD operations for notes and AI note generation
 */

/**
 * Get all notes for a paper
 * GET /api/papers/:id/notes
 */
export const getNotes = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify paper access
        const paper = await Paper.findById(id).populate('projectId', 'userId');
        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Get notes
        const notes = await Note.find({ paperId: id, userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            notes,
            count: notes.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create note
 * POST /api/papers/:id/notes
 * Body: { content, section? }
 */
export const createNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, section } = req.body;

        if (!content) {
            throw new AppError('Note content required', 400, 'MISSING_CONTENT');
        }

        // Verify paper access
        const paper = await Paper.findById(id).populate('projectId', 'userId');
        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Create note
        const note = new Note({
            paperId: id,
            userId: req.user.id,
            content,
            section,
            type: 'manual',
        });

        await note.save();

        logger.success('Note created');

        res.status(201).json({
            message: 'Note created successfully',
            note,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update note
 * PUT /api/notes/:id
 * Body: { content, section? }
 */
export const updateNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, section } = req.body;

        const note = await Note.findById(id);

        if (!note) {
            throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
        }

        // Check ownership
        if (note.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        if (content) note.content = content;
        if (section !== undefined) note.section = section;

        await note.save();

        res.json({
            message: 'Note updated successfully',
            note,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 */
export const deleteNote = async (req, res, next) => {
    try {
        const { id } = req.params;

        const note = await Note.findById(id);

        if (!note) {
            throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
        }

        // Check ownership
        if (note.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        await note.deleteOne();

        logger.info('Note deleted');

        res.json({
            message: 'Note deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate AI note for section
 * POST /api/papers/:id/ai-notes
 * Body: { section, prompt }
 */
export const generateAINote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { section, prompt } = req.body;

        if (!section || !prompt) {
            throw new AppError('Section and prompt required', 400, 'MISSING_FIELDS');
        }

        // Verify paper access
        const paper = await Paper.findById(id).populate('projectId', 'userId');
        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Find section content
        const sectionData = paper.sections.find(s => s.name === section);
        if (!sectionData) {
            throw new AppError('Section not found', 404, 'SECTION_NOT_FOUND');
        }

        // Generate AI note
        const llm = getLLMClient();
        const fullPrompt = `${prompt}\n\nSection: ${section}\n\nContent:\n${sectionData.content}`;

        const content = await llm.generate(fullPrompt, {
            temperature: 0.7,
            maxTokens: 1000,
        });

        // Save as AI note
        const note = new Note({
            paperId: id,
            userId: req.user.id,
            content,
            section,
            type: 'ai',
            metadata: {
                prompt,
                model: 'gpt-4-turbo-preview',
            },
        });

        await note.save();

        logger.success('AI note generated');

        res.status(201).json({
            message: 'AI note generated successfully',
            note,
        });
    } catch (error) {
        next(error);
    }
};
