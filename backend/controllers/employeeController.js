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