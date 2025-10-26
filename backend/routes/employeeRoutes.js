import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import hrMiddleware from '../middlewares/hrMiddleware.js';

const router = express.Router();

// ----------------------------
// Employee Self-Service Routes
// ----------------------------
router.get('/me', authMiddleware, getMyProfileController);
router.put('/me', authMiddleware, updateMyProfileController);
router.get('/onboarding-status', authMiddleware, getOnboardingStatusController);

// ----------------------------
// HR - Onboarding Application Review
// ----------------------------
router.get('/onboarding/review', authMiddleware, hrMiddleware, getAllOnboardingApplicationsController);
router.get('/onboarding/review/:employeeId', authMiddleware, hrMiddleware, viewOnboardingApplicationController);
router.put('/onboarding/review/:employeeId', authMiddleware, hrMiddleware, reviewOnboardingApplicationController);

// ----------------------------
// HR - Employee Management
// ----------------------------
router.get('/', authMiddleware, hrMiddleware, getAllEmployeesController);
router.get('/:employeeId', authMiddleware, hrMiddleware, getEmployeeByIdController);

// ----------------------------
// HR - Visa Status Management
// ----------------------------
router.get('/visa-status', authMiddleware, hrMiddleware, getAllVisaStatusEmployeesController);
router.get('/visa-status/in-progress', authMiddleware, hrMiddleware, getEmployeesWithIncompleteOptDocsController);
router.get('/visa-status/document/:employeeId', authMiddleware, hrMiddleware, getPendingVisaDocumentController);
router.put('/visa-status/document/:docId/review', authMiddleware, hrMiddleware, reviewVisaDocumentController);
router.post('/visa-status/notify/:employeeId', authMiddleware, hrMiddleware, sendNextStepReminderController);

export default router;