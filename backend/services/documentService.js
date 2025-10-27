import { Document } from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const documentService = {
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

  async getMyDocuments(employeeId) {
    try {
      const documents = await Document.find({ employeeId })
        .sort({ type: 1 });
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },


  async uploadOrReplaceDocument(employeeId, documentType, file) {
    try {
      let document = await Document.findOne({ 
        employeeId, 
        type: documentType 
      });

      if (document) {
        if (document.fileUrl) {
          const oldFilePath = path.join(__dirname, '..', 'uploads', document.fileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        
        document.fileName = file.filename;
        document.fileUrl = `/uploads/${file.filename}`;
        document.status = 'pending';
        document.hrFeedback = '';
        document.reviewedAt = null;
        await document.save();
      } else {
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

  async getDocumentById(documentId) {
    try {
      const document = await Document.findById(documentId)
        .populate('employeeId', 'username email');
      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getFilePath(fileName) {
    return path.join(__dirname, '..', 'uploads', fileName);
  },

  fileExists(fileName) {
    const filePath = this.getFilePath(fileName);
    return fs.existsSync(filePath);
  }
};