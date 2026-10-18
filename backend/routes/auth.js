import express from 'express';
import { signup, login, getMe, updateUser, addCoins } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateUser);
router.post('/me/add-coins', authMiddleware, addCoins);

export default router;
