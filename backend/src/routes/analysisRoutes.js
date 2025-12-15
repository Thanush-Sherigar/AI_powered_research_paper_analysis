import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    getSummaries,
    getReview,
    compare,
    search,
    ask,
    getConceptGraph,
    getNoveltyRadar,
    checkNoveltyWeb,
    checkNoveltyPair,
    suggestExperimentsHandler,
    getReadingPath,
    citationCheck,
    getResourcesSummary,
    getMindMap,
    checkEthicsHandler,
    compareVersionsHandler,
} from '../controllers/analysisController.js';

const router = express.Router();

/**
 * Analysis Routes
 * All routes require authentication
 */

// GET /api/papers/:id/summaries?mode=tldr|paragraph|detailed
router.get('/papers/:id/summaries', authenticate, getSummaries);

// POST /api/papers/:id/review
router.post('/papers/:id/review', authenticate, getReview);

// POST /api/compare
router.post('/compare', authenticate, compare);

// POST /api/search
router.post('/search', authenticate, search);

// POST /api/ask
router.post('/ask', authenticate, ask);

// GET /api/papers/:id/concept-graph
router.get('/papers/:id/concept-graph', authenticate, getConceptGraph);

// GET /api/projects/:id/novelty-radar
router.get('/projects/:id/novelty-radar', authenticate, getNoveltyRadar);

// POST /api/projects/:id/novelty/web
router.post('/projects/:id/novelty/web', authenticate, checkNoveltyWeb);

// POST /api/projects/:id/novelty/pair
router.post('/projects/:id/novelty/pair', authenticate, checkNoveltyPair);

// POST /api/papers/:id/suggest-experiments
router.post('/papers/:id/suggest-experiments', authenticate, suggestExperimentsHandler);

// POST /api/reading-path
router.post('/reading-path', authenticate, getReadingPath);

// POST /api/citation-check
router.post('/citation-check', authenticate, citationCheck);

// GET /api/papers/:id/resources-summary
router.get('/papers/:id/resources-summary', authenticate, getResourcesSummary);

// GET /api/papers/:id/mind-map
router.get('/papers/:id/mind-map', authenticate, getMindMap);

// POST /api/papers/:id/ethics-check
router.post('/papers/:id/ethics-check', authenticate, checkEthicsHandler);

// POST /api/compare-versions
router.post('/compare-versions', authenticate, compareVersionsHandler);

export default router;
