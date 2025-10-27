import { Document } from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const documentService = {
  // Get documents for a specific employee
  async getEmployeeDocuments(employeeId) {
    try {
      const documents = await Document.find({ employeeId })
        .populate('employeeId', 'username email')
        .sort({ type: 1 });
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user's documents
  async getMyDocuments(employeeId) {
    try {
      const documents = await Document.find({ employeeId })
        .sort({ type: 1 });
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Upload or replace a document
  async uploadOrReplaceDocument(employeeId, documentType, file) {
    try {
      // Check if document already exists
      let document = await Document.findOne({ 
        employeeId, 
        type: documentType 
      });

      if (document) {
        // Delete old file if exists
        if (document.fileUrl) {
          const oldFilePath = path.join(__dirname, '..', 'uploads', document.fileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        
        // Update existing document
        document.fileName = file.filename;
        document.fileUrl = `/uploads/${file.filename}`;
        document.status = 'pending';
        document.hrFeedback = '';
        document.reviewedAt = null;
        await document.save();
      } else {
        // Create new document
        document = new Document({
          employeeId,
          type: documentType,
          fileName: file.filename,
          fileUrl: `/uploads/${file.filename}`,
          status: 'pending'
        });
        await document.save();
      }

      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Review document (approve/reject)
  async reviewDocument(documentId, status, hrFeedback, hrId) {
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      document.status = status;
      document.hrFeedback = hrFeedback || '';
      document.reviewedAt = new Date();
      await document.save();

      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get document by ID
  async getDocumentById(documentId) {
    try {
      const document = await Document.findById(documentId)
        .populate('employeeId', 'username email');
      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get file path for serving
  getFilePath(fileName) {
    return path.join(__dirname, '..', 'uploads', fileName);
  },

  // Check if file exists
  fileExists(fileName) {
    const filePath = this.getFilePath(fileName);
    return fs.existsSync(filePath);
  }
};