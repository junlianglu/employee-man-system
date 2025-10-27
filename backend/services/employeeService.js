import { Employee } from '../models/Employee.js';

export const getOnboardingStatus = async (employeeId) => {
  const employee = await Employee.findById(employeeId)
    .select('onboardingReview documents')
    .populate('documents');
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return {
    status: employee.onboardingReview.status,
    hrFeedback: employee.onboardingReview.hrFeedback,
    documents: employee.documents
  };
};

export const getAllOnboardingApplications = async (status = null) => {
  let query = {};
  
  if (status) {
    query['onboardingReview.status'] = status;
  }
  
  const employees = await Employee.find(query)
    .select('firstName middleName lastName email onboardingReview createdAt')
    .sort({ createdAt: -1 })
    .lean();
  
  return employees;
};

export const viewOnboardingApplication = async (employeeId) => {
  const employee = await Employee.findById(employeeId)
    .select('-password')
    .populate('documents');
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return employee;
};

export const reviewOnboardingApplication = async (employeeId, reviewData) => {
  const { status, hrFeedback } = reviewData;
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new Error('Invalid review status');
  }
  
  const employee = await Employee.findById(employeeId);
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  employee.onboardingReview.status = status;
  employee.onboardingReview.hrFeedback = hrFeedback || '';
  
  await employee.save();
  
  return employee;
};