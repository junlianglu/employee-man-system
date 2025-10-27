import { documentService } from '../services/documentService.js';
import path from 'path';
import fs from 'fs';

export const getMyDocumentsController = async (req, res) => {
  try {
    const result = await documentService.getMyDocuments(req.employee.id);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ documents: result.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEmployeeDocumentsController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await documentService.getEmployeeDocuments(employeeId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ documents: result.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadOrReplaceDocumentController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const validTypes = [
      'profile_picture', 'drivers_license', 'work_authorization',
      'opt_receipt', 'opt_ead', 'i983', 'i20'
    ];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const result = await documentService.uploadOrReplaceDocument(
      req.employee.id,
      type,
      req.file
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ 
      message: 'Document uploaded successfully',
      document: result.data 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reviewDocumentController = async (req, res) => {
  try {
    const { docId } = req.params;
    const { status, hrFeedback } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (approved/rejected) is required' });
    }

    const result = await documentService.reviewDocument(
      docId,
      status,
      hrFeedback,
      req.employee.id
    );

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ 
      message: 'Document reviewed successfully',
      document: result.data 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const viewDocumentController = async (req, res) => {
  try {
    const { docId } = req.params;
    const result = await documentService.getDocumentById(docId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    const document = result.data;
    
    if (document.employeeId._id.toString() !== req.employee.id && !req.employee.isHR) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!documentService.fileExists(document.fileName)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = documentService.getFilePath(document.fileName);
    const fileExtension = path.extname(document.fileName).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(fileExtension)) contentType = 'image/jpeg';
    else if (fileExtension === '.png') contentType = 'image/png';
    else if (fileExtension === '.pdf') contentType = 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadDocumentController = async (req, res) => {
  try {
    const { docId } = req.params;
    const result = await documentService.getDocumentById(docId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    const document = result.data;
    
    if (document.employeeId._id.toString() !== req.employee.id && !req.employee.isHR) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!documentService.fileExists(document.fileName)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = documentService.getFilePath(document.fileName);
    
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const hrViewDocumentController = async (req, res) => {
  try {
    const { docId } = req.params;
    const result = await documentService.getDocumentById(docId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    const document = result.data;

    if (!documentService.fileExists(document.fileName)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = documentService.getFilePath(document.fileName);
    const fileExtension = path.extname(document.fileName).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(fileExtension)) contentType = 'image/jpeg';
    else if (fileExtension === '.png') contentType = 'image/png';
    else if (fileExtension === '.pdf') contentType = 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const hrDownloadDocumentController = async (req, res) => {
  try {
    const { docId } = req.params;
    const result = await documentService.getDocumentById(docId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    const document = result.data;

    if (!documentService.fileExists(document.fileName)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = documentService.getFilePath(document.fileName);
    
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};