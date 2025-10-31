import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { hrMiddleware } from '../middlewares/hrMiddleware.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';
import path from 'path';
import { getMyDocumentsController, uploadOrReplaceDocumentController, viewDocumentController, downloadDocumentController, getEmployeeDocumentsController, reviewDocumentController, hrViewDocumentController, hrDownloadDocumentController } from '../controllers/documentController.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/templates/i983-empty', (req, res) => {
    const templatePath = path.join(__dirname, '..', 'templates', 'I-983-Empty-Template.pdf');
    console.log('Template path:', templatePath);
    console.log('File exists:', fs.existsSync(templatePath));
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.download(templatePath, 'I-983-Empty-Template.pdf', (err) => {
      if (err && !res.headersSent) {
        console.error('Template download error:', err);
        res.status(500).json({ error: 'Failed to download template' });
      }
    });
  });
  
  router.get('/templates/i983-sample', (req, res) => {
    const templatePath = path.join(__dirname, '..', 'templates', 'I-983-Sample-Template.pdf');
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.download(templatePath, 'I-983-Sample-Template.pdf', (err) => {
      if (err && !res.headersSent) {
        console.error('Template download error:', err);
        res.status(500).json({ error: 'Failed to download template' });
      }
    });
  });


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
router.get('/hr/view/:docId', authMiddleware, hrMiddleware, hrViewDocumentController);       // Inline view for HR
router.get('/hr/download/:docId', authMiddleware, hrMiddleware, hrDownloadDocumentController); // Download for HR
router.put('/review/:docId', authMiddleware, hrMiddleware, reviewDocumentController);     // Approve/Reject with feedback
router.get('/:employeeId', authMiddleware, hrMiddleware, getEmployeeDocumentsController); // Get any employee's documents

export default router;