import * as employeeService from '../services/employeeService.js';

export const getOnboardingStatusController = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    const onboardingData = await employeeService.getOnboardingStatus(employeeId);
    
    res.status(200).json({
      message: 'Onboarding status retrieved successfully',
      ...onboardingData
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ error: 'Failed to retrieve onboarding status' });
  }
};

export const getAllOnboardingApplicationsController = async (req, res) => {
  try {
    const { status } = req.query;
    
    const applications = await employeeService.getAllOnboardingApplications(status);
    
    res.status(200).json({
      message: 'Onboarding applications retrieved successfully',
      applications
    });
  } catch (error) {
    console.error('Get onboarding applications error:', error);
    res.status(500).json({ error: 'Failed to retrieve onboarding applications' });
  }
};

export const viewOnboardingApplicationController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await employeeService.viewOnboardingApplication(employeeId);
    
    res.status(200).json({
      message: 'Onboarding application retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('View onboarding application error:', error);
    
    if (error.message === 'Employee not found') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.status(500).json({ error: 'Failed to retrieve onboarding application' });
  }
};

export const reviewOnboardingApplicationController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, hrFeedback } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }
    
    if (status === 'rejected' && !hrFeedback) {
      return res.status(400).json({ error: 'Feedback is required when rejecting' });
    }
    
    const employee = await employeeService.reviewOnboardingApplication(employeeId, {
      status,
      hrFeedback
    });
    
    res.status(200).json({
      message: 'Onboarding application reviewed successfully',
      employee
    });
  } catch (error) {
    console.error('Review onboarding application error:', error);
    
    if (error.message === 'Employee not found') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    if (error.message === 'Invalid review status') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to review onboarding application' });
  }
};


export const getMyProfileController = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    const employee = await employeeService.getEmployeeById(employeeId);
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

export const updateMyProfileController = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    const updateData = req.body;
    
    const employee = await employeeService.updateEmployee(employeeId, updateData);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};


export const getAllEmployeesController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const employees = await employeeService.getAllEmployees({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status
    });
    
    res.status(200).json({
      message: 'Employees retrieved successfully',
      ...employees
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ error: 'Failed to retrieve employees' });
  }
};

export const getEmployeeByIdController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await employeeService.getEmployeeById(employeeId);
    
    res.status(200).json({
      message: 'Employee retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    
    if (error.message === 'Employee not found') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.status(500).json({ error: 'Failed to retrieve employee' });
  }
};



export const getAllVisaStatusEmployeesController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await employeeService.getAllVisaStatusEmployees({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.status(200).json({
      message: 'Visa status employees retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get visa status employees error:', error);
    res.status(500).json({ error: 'Failed to retrieve visa status employees' });
  }
};

export const getEmployeesWithIncompleteOptDocsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await employeeService.getEmployeesWithIncompleteOptDocs({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.status(200).json({
      message: 'In-progress OPT employees retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get in-progress OPT employees error:', error);
    res.status(500).json({ error: 'Failed to retrieve in-progress OPT employees' });
  }
};

export const getPendingVisaDocumentController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const documents = await employeeService.getPendingVisaDocuments(employeeId);
    
    res.status(200).json({
      message: 'Pending visa documents retrieved successfully',
      documents
    });
  } catch (error) {
    console.error('Get pending visa documents error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending visa documents' });
  }
};

export const reviewVisaDocumentController = async (req, res) => {
  try {
    const { docId } = req.params;
    const { status, feedback } = req.body;
    
    const document = await employeeService.reviewVisaDocument(docId, { status, feedback });
    
    res.status(200).json({
      message: 'Visa document reviewed successfully',
      document
    });
  } catch (error) {
    console.error('Review visa document error:', error);
    res.status(500).json({ error: 'Failed to review visa document' });
  }
};

export const sendNextStepReminderController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    await employeeService.sendNextStepReminder(employeeId);
    
    res.status(200).json({
      message: 'Reminder sent successfully'
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
};