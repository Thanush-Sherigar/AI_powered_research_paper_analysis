import Paper from '../models/Paper.js';
import Project from '../models/Project.js';
import { generateSummary } from '../services/summaryService.js';
import { generateReview } from '../services/reviewService.js';
import { comparePapers } from '../services/comparisonService.js';
import { extractConceptGraph } from '../services/conceptGraphService.js';
import { analyzeNovelty } from '../services/noveltyService.js';
import { semanticSearch } from '../services/searchService.js';
import { answerQuestion } from '../services/qaService.js';
import { suggestExperiments } from '../services/experimentService.js';
import { generateReadingPath } from '../services/readingPathService.js';
import { checkCitations } from '../services/citationService.js';
import { extractResources } from '../services/resourceService.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Analysis Controller
 * Handles all AI-powered analysis endpoints
 */

/**
 * Get paper summaries
 * GET /api/papers/:id/summaries?mode=tldr|paragraph|detailed
 */
export const getSummaries = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mode = 'tldr' } = req.query;

        const paper = await Paper.findById(id).populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Check cache first
        const cacheKey = `${mode}Summary`;
        if (paper.cachedAnalyses && paper.cachedAnalyses[cacheKey]) {
            logger.info(`Returning cached ${mode} summary`);
            return res.json({
                summary: paper.cachedAnalyses[cacheKey],
                cached: true,
            });
        }

        // Generate summary
        const summary = await generateSummary(paper, mode);

        // Cache result
        if (!paper.cachedAnalyses) {
            paper.cachedAnalyses = {};
        }
        paper.cachedAnalyses[cacheKey] = summary;
        paper.markModified('cachedAnalyses');
        await paper.save();

        res.json({
            summary,
            cached: false,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get paper review
 * POST /api/papers/:id/review
 */
export const getReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const paper = await Paper.findById(id).populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Check cache
        if (paper.cachedAnalyses && paper.cachedAnalyses.review) {
            logger.info('Returning cached review');
            return res.json({
                review: paper.cachedAnalyses.review,
                cached: true,
            });
        }

        // Generate review
        const review = await generateReview(paper);

        // Cache result
        if (!paper.cachedAnalyses) {
            paper.cachedAnalyses = {};
        }
        paper.cachedAnalyses.review = review;
        paper.markModified('cachedAnalyses');
        await paper.save();
        logger.info('Review saved to cache');

        res.json({
            review,
            cached: false,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Compare papers
 * POST /api/compare
 * Body: { paperIds: [id1, id2, ...] }
 */
export const compare = async (req, res, next) => {
    try {
        const { paperIds } = req.body;

        if (!paperIds || !Array.isArray(paperIds) || paperIds.length < 2) {
            throw new AppError('At least 2 paper IDs required', 400, 'INVALID_INPUT');
        }

        // Fetch papers and verify access
        const papers = await Paper.find({ _id: { $in: paperIds } })
            .populate('projectId', 'userId');

        if (papers.length !== paperIds.length) {
            throw new AppError('Some papers not found', 404, 'PAPERS_NOT_FOUND');
        }

        // Verify all papers belong to user
        const allOwned = papers.every(p => p.projectId.userId.toString() === req.user.id);
        if (!allOwned) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Compare papers
        const comparison = await comparePapers(papers);

        res.json(comparison);
    } catch (error) {
        next(error);
    }
};

/**
 * Semantic search
 * POST /api/search
 * Body: { query, projectId, topK }
 */
export const search = async (req, res, next) => {
    try {
        const { query, projectId, topK = 5 } = req.body;

        if (!query || !projectId) {
            throw new AppError('Query and projectId required', 400, 'INVALID_INPUT');
        }

        // Verify project access
        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Perform search
        const results = await semanticSearch(query, projectId, topK);

        res.json({
            query,
            results,
            count: results.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Ask question about papers
 * POST /api/ask
 * Body: { question, projectId, paperId? }
 */
export const ask = async (req, res, next) => {
    try {
        const { question, projectId, paperId } = req.body;

        if (!question || !projectId) {
            throw new AppError('Question and projectId required', 400, 'INVALID_INPUT');
        }

        // Verify project access
        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Answer question
        const answer = await answerQuestion(question, projectId, paperId);

        res.json(answer);
    } catch (error) {
        next(error);
    }
};

/**
 * Get concept graph
 * GET /api/papers/:id/concept-graph
 */
export const getConceptGraph = async (req, res, next) => {
    try {
        const { id } = req.params;

        const paper = await Paper.findById(id).populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Check cache
        if (paper.cachedAnalyses && paper.cachedAnalyses.conceptGraph) {
            logger.info('Returning cached concept graph');
            return res.json({
                graph: paper.cachedAnalyses.conceptGraph,
                cached: true,
            });
        }

        // Extract concept graph
        const graph = await extractConceptGraph(paper);

        // Cache result
        if (!paper.cachedAnalyses) {
            paper.cachedAnalyses = {};
        }
        paper.cachedAnalyses.conceptGraph = graph;
        await paper.save();

        res.json({
            graph,
            cached: false,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get novelty radar for project
 * GET /api/projects/:id/novelty-radar
 */
export const getNoveltyRadar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id).populate('papers');

        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        // Check access
        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        if (project.papers.length < 2) {
            throw new AppError('At least 2 papers required', 400, 'INSUFFICIENT_PAPERS');
        }

        // Analyze novelty
        const analysis = await analyzeNovelty(project.papers);

        res.json(analysis);
    } catch (error) {
        next(error);
    }
};

/**
 * Suggest experiments
 * POST /api/papers/:id/suggest-experiments
 * Body: { userIdea }
 */
export const suggestExperimentsHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userIdea } = req.body;

        if (!userIdea) {
            throw new AppError('User idea required', 400, 'MISSING_IDEA');
        }

        const paper = await Paper.findById(id).populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Generate suggestions
        const suggestions = await suggestExperiments(paper, userIdea);

        res.json(suggestions);
    } catch (error) {
        next(error);
    }
};

/**
 * Get reading path
 * POST /api/reading-path
 * Body: { projectId, topic, level }
 */
export const getReadingPath = async (req, res, next) => {
    try {
        const { projectId, topic, level = 'intermediate' } = req.body;

        if (!projectId || !topic) {
            throw new AppError('ProjectId and topic required', 400, 'INVALID_INPUT');
        }

        const project = await Project.findById(projectId).populate('papers');

        if (!project) {
            throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }

        // Check access
        if (project.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        if (project.papers.length === 0) {
            throw new AppError('No papers in project', 400, 'NO_PAPERS');
        }

        // Generate reading path
        const path = await generateReadingPath(project.papers, topic, level);

        res.json(path);
    } catch (error) {
        next(error);
    }
};

/**
 * Check citations
 * POST /api/citation-check
 * Body: { text, paperIds }
 */
export const citationCheck = async (req, res, next) => {
    try {
        const { text, paperIds } = req.body;

        if (!text || !paperIds || !Array.isArray(paperIds)) {
            throw new AppError('Text and paperIds required', 400, 'INVALID_INPUT');
        }

        // Fetch papers and verify access
        const papers = await Paper.find({ _id: { $in: paperIds } })
            .populate('projectId', 'userId');

        if (papers.length === 0) {
            throw new AppError('No papers found', 404, 'PAPERS_NOT_FOUND');
        }

        // Verify all papers belong to user
        const allOwned = papers.every(p => p.projectId.userId.toString() === req.user.id);
        if (!allOwned) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Check citations
        const results = await checkCitations(text, papers);

        res.json(results);
    } catch (error) {
        next(error);
    }
};

/**
 * Get resources summary
 * GET /api/papers/:id/resources-summary
 */
export const getResourcesSummary = async (req, res, next) => {
    try {
        const { id } = req.params;

        const paper = await Paper.findById(id).populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Check access
        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        // Check cache
        if (paper.cachedAnalyses && paper.cachedAnalyses.resourcesSummary) {
            logger.info('Returning cached resources summary');
            return res.json({
                resources: paper.cachedAnalyses.resourcesSummary,
                cached: true,
            });
        }

        // Extract resources
        const resources = await extractResources(paper);

        // Cache result
        if (!paper.cachedAnalyses) {
            paper.cachedAnalyses = {};
        }
        paper.cachedAnalyses.resourcesSummary = resources;
        await paper.save();

        res.json({
            resources,
            cached: false,
        });
    } catch (error) {
        next(error);
    }
};
