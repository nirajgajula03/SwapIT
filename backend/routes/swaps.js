import express from 'express';
import { getSwaps, proposeSwap, respondToSwap } from '../controllers/swapController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getSwaps);
router.post('/propose', authMiddleware, proposeSwap);
router.post('/:id/respond', authMiddleware, respondToSwap);

export default router;
