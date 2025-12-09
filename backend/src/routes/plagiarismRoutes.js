import express from 'express';
import { checkWebPlagiarism, checkInternalSimilarity, checkFileReport, checkHumanismScore } from '../controllers/plagiarismController.js';
import { uploadMiddleware } from '../controllers/paperController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post('/check-web', checkWebPlagiarism);
router.post('/check-internal', checkInternalSimilarity);
router.post('/check-file', uploadMiddleware, checkFileReport);
router.post('/check-humanism', checkHumanismScore);

export default router;
