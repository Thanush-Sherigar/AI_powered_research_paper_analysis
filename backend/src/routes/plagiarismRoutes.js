import express from 'express';
import { checkWebPlagiarism, checkInternalSimilarity } from '../controllers/plagiarismController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post('/check-web', checkWebPlagiarism);
router.post('/check-internal', checkInternalSimilarity);

export default router;
