import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import hrMiddleware from '../middlewares/hrMiddleware.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';
import { getMyDocumentsController, uploadOrReplaceDocumentController, viewDocumentController, downloadDocumentController, getEmployeeDocumentsController, reviewDocumentController, hrViewDocumentController, hrDownloadDocumentController } from '../controllers/documentController.js';

const router = express.Router();

// ----------------------------
// Employee Document Routes
// ----------------------------
router.get('/me', authMiddleware, getMyDocumentsController); // Get own documents
router.post('/upload', authMiddleware, uploadMiddleware.single('file'), uploadOrReplaceDocumentController); // Upload or replace

router.get('/view/:docId', authMiddleware, viewDocumentController);       // Inline view for employee
router.get('/download/:docId', authMiddleware, downloadDocumentController); // Download for employee

// ----------------------------
// HR Document Routes
// ----------------------------
router.get('/:employeeId', authMiddleware, hrMiddleware, getEmployeeDocumentsController); // Get any employee's documents
router.put('/review/:docId', authMiddleware, hrMiddleware, reviewDocumentController);     // Approve/Reject with feedback

router.get('/hr/view/:docId', authMiddleware, hrMiddleware, hrViewDocumentController);       // Inline view for HR
router.get('/hr/download/:docId', authMiddleware, hrMiddleware, hrDownloadDocumentController); // Download for HR

export default router;