import Project from '../models/Project.js';
import Paper from '../models/Paper.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Project Controller
 * Handles CRUD operations for projects
 */

/**
 * Get all projects for current user
 * GET /api/projects
 */
export const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ userId: req.user.id })
            .populate('papers', 'title authors createdAt')
            .sort({ 'metadata.lastActivity': -1 });

        res.json({
            projects,
            count: projects.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
export const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('papers', 'title authors abstract createdAt metadata.year');

        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        res.json(project);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new project
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            throw new AppError('Project name is required', 400, 'MISSING_NAME');
        }

        const project = new Project({
            userId: req.user.id,
            name,
            description,
        });

        await project.save();

        logger.success(`Project created: ${name}`);

        res.status(201).json({
            message: 'Project created successfully',
            project,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        if (name) project.name = name;
        if (description !== undefined) project.description = description;

        await project.save();

        res.json({
            message: 'Project updated successfully',
            project,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Delete all papers in project
        await Paper.deleteMany({ projectId: project._id });

        // Delete project
        await project.deleteOne();

        logger.info(`Project deleted: ${project.name}`);

        res.json({
            message: 'Project deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all papers in a project
 * GET /api/projects/:id/papers
 */
export const getProjectPapers = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        const papers = await Paper.find({ projectId: project._id }).sort({ createdAt: -1 });

        res.json(papers);
    } catch (error) {
        next(error);
    }
};
