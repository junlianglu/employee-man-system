import express from 'express';
import { 
    loginEmployeeController, 
    logoutEmployeeController, 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginEmployeeController);
router.post('/signup', logoutEmployeeController);

export default router;