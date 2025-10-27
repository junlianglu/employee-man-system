import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import hrMiddleware from '../middlewares/hrMiddleware.js';
import { getAllRegistrationTokensController, generateRegistrationTokenController, validateRegistrationTokenController, completeRegistrationController } from '../controllers/registrationTokenController.js';

const router = express.Router();

// ----------------------------
// HR - Registration Token Management
// ----------------------------
router.get('/', authMiddleware, hrMiddleware, getAllRegistrationTokensController);   // View all tokens sent
router.post('/', authMiddleware, hrMiddleware, generateRegistrationTokenController); // Generate & send new token

// ----------------------------
// Employee - Registration via Token
// ----------------------------
router.get('/:token', validateRegistrationTokenController);      // Validate token before registration
router.post('/:token/submit', completeRegistrationController);   // Complete registration and create employee

export default router;