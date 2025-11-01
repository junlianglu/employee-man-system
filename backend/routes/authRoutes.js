import express from 'express';
import { 
    loginEmployeeController,
    getCurrentEmployeeController
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', loginEmployeeController);
router.get('/me', authMiddleware, getCurrentEmployeeController);

export default router;