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
import { generateMindMap } from '../services/mindMapService.js';
import { checkCitations } from '../services/citationService.js';
import { extractResources } from '../services/resourceService.js';
import { checkEthics } from '../services/ethicsService.js';
import { compareVersions } from '../services/comparisonService.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { checkWeb } from '../services/plagiarismService.js';
import axios from 'axios';
import config from '../config/index.js';
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
            const cachedSummary = paper.cachedAnalyses[cacheKey];
            // Only return cache if it's not an error message
            if (!cachedSummary.includes('The AI service is currently unavailable')) {
                logger.info(`Returning cached ${mode} summary`);
                return res.json({
                    summary: cachedSummary,
                    cached: true,
                });
            }
        }

        // Generate summary
        const summary = await generateSummary(paper, mode);

        // Cache result ONLY if it's not an error message
        if (!summary.includes('The AI service is currently unavailable')) {
            if (!paper.cachedAnalyses) {
                paper.cachedAnalyses = {};
            }
            paper.cachedAnalyses[cacheKey] = summary;
            paper.markModified('cachedAnalyses');
            await paper.save();
        }

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
            const cachedReview = paper.cachedAnalyses.review;
            // Only return cache if it's not an error message/object
            const isErrorMock = typeof cachedReview === 'object' && cachedReview.assessment === "AI Service Unavailable (Mock)";
            const isErrorString = typeof cachedReview === 'string' && cachedReview.includes('The AI service is currently unavailable');

            if (!isErrorMock && !isErrorString) {
                logger.info('Returning cached review');
                return res.json({
                    review: cachedReview,
                    cached: true,
                });
            }
        }

        // Generate review
        const review = await generateReview(paper, domain);

        // Cache result ONLY if it's not an error message
        const isErrorMock = typeof review === 'object' && review.assessment === "AI Service Unavailable (Mock)";

        if (!isErrorMock) {
            if (!paper.cachedAnalyses) {
                paper.cachedAnalyses = {};
            }
            paper.cachedAnalyses.review = review;
            paper.markModified('cachedAnalyses');
            await paper.save();
            logger.info('Review saved to cache');
        }

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
 * Check novelty against web
 * POST /api/projects/:id/novelty/web
 * Body: { paperId }
 */
export const checkNoveltyWeb = async (req, res, next) => {
    try {
        const { id } = req.params; // Project ID
        const { paperId } = req.body;

        if (!paperId) {
            throw new AppError('Paper ID required', 400, 'INVALID_INPUT');
        }

        const userPaper = await Paper.findById(paperId);
        if (!userPaper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        // Search web for related papers using the title
        // We use the same Google Search config as plagiarism service
        const apiKey = config.googleSearch.apiKey;
        const cx = config.googleSearch.searchEngineId;

        if (!apiKey || !cx) {
            throw new AppError('Google Search not configured', 503, 'SERVICE_UNAVAILABLE');
        }

        const query = userPaper.title;
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q="${encodeURIComponent(query)}"`;

        const response = await axios.get(searchUrl);
        const items = response.data.items || [];

        // Convert web results to "Paper" objects for comparison
        const webPapers = items.slice(0, 4).map(item => ({
            title: item.title,
            abstract: item.snippet, // Use snippet as abstract
            authors: [],
            isWebSource: true,
            url: item.link
        }));

        if (webPapers.length === 0) {
            return res.json({
                summary: "No similar papers found on the web to compare against.",
                papers: [{
                    title: userPaper.title,
                    noveltyScore: 10,
                    uniqueContributions: ["Analysis limited - no web matches found."],
                    overlaps: []
                }]
            });
        }

        const papersToCompare = [userPaper, ...webPapers];
        const analysis = await analyzeNovelty(papersToCompare);

        res.json(analysis);

    } catch (error) {
        next(error);
    }
};

/**
 * Check novelty pairwise (2 papers)
 * POST /api/projects/:id/novelty/pair
 * Body: { paperIds: [id1, id2] }
 */
export const checkNoveltyPair = async (req, res, next) => {
    try {
        const { paperIds } = req.body;

        if (!paperIds || !Array.isArray(paperIds) || paperIds.length !== 2) {
            throw new AppError('Exactly 2 paper IDs required', 400, 'INVALID_INPUT');
        }

        const papers = await Paper.find({ _id: { $in: paperIds } });

        if (papers.length !== 2) {
            throw new AppError('Papers not found', 404, 'PAPERS_NOT_FOUND');
        }

        const analysis = await analyzeNovelty(papers);

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

/**
 * Get mind map
 * GET /api/papers/:id/mind-map
 */
export const getMindMap = async (req, res, next) => {
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
        if (paper.cachedAnalyses && paper.cachedAnalyses.mindMap) {
            logger.info('Returning cached mind map');
            return res.json({
                mindMap: paper.cachedAnalyses.mindMap,
                cached: true,
            });
        }

        // Generate mind map
        const mindMap = await generateMindMap(paper);

        // Cache result
        if (!paper.cachedAnalyses) {
            paper.cachedAnalyses = {};
        }
        paper.cachedAnalyses.mindMap = mindMap;
        await paper.save();

        res.json({
            mindMap,
            cached: false,
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Check ethics
 * POST /api/papers/:id/ethics-check
 */
export const checkEthicsHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const paper = await Paper.findById(id).populate('projectId', 'userId');

        if (!paper) {
            throw new AppError('Paper not found', 404, 'PAPER_NOT_FOUND');
        }

        if (paper.projectId.userId.toString() !== req.user.id) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        const { mode } = req.query; // 'summary' or 'detailed'
        const ethics = await checkEthics(paper, mode);

        res.json(ethics);
    } catch (error) {
        next(error);
    }
};

/**
 * Compare versions
 * POST /api/compare-versions
 * Body: { oldPaperId, newPaperId }
 */
export const compareVersionsHandler = async (req, res, next) => {
    try {
        const { oldPaperId, newPaperId } = req.body;

        if (!oldPaperId || !newPaperId) {
            throw new AppError('Both oldPaperId and newPaperId are required', 400, 'INVALID_INPUT');
        }

        const papers = await Paper.find({ _id: { $in: [oldPaperId, newPaperId] } }).populate('projectId', 'userId');

        if (papers.length !== 2) {
            throw new AppError('Papers not found', 404, 'PAPERS_NOT_FOUND');
        }

        const allowed = papers.every(p => p.projectId.userId.toString() === req.user.id);
        if (!allowed) {
            throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }

        const [p1, p2] = papers;
        // Determine which is old/new if not strictly ordered by ID input, but here we trust input map
        const oldPaper = p1._id.toString() === oldPaperId ? p1 : p2;
        const newPaper = p1._id.toString() === newPaperId ? p1 : p2;

        const comparison = await compareVersions(oldPaper, newPaper);

        res.json(comparison);
    } catch (error) {
        next(error);
    }
};
