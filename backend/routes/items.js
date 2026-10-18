import express from 'express';
import { getMarketplaceItems, getMyItems, addItem, updateItem, deleteItem } from '../controllers/itemController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/marketplace', authMiddleware, getMarketplaceItems);
router.get('/my-items', authMiddleware, getMyItems);
router.post('/', authMiddleware, addItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

export default router;
