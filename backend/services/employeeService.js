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
  
  if (status === 'approved') {
    const Document = (await import('../models/Document.js')).Document;
    const nonOptDocumentTypes = ['profile_picture', 'drivers_license', 'work_authorization'];
    
    await Document.updateMany(
      {
        employeeId: employeeId,
        type: { $in: nonOptDocumentTypes },
        status: 'pending'
      },
      {
        $set: {
          status: 'approved',
          reviewedAt: new Date()
        }
      }
    );
  }
  
  return employee;
};


export const getEmployeeById = async (employeeId) => {
  const employee = await Employee.findById(employeeId)
    .select('-password')
    .populate('documents');
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return employee;
};

export const updateEmployee = async (employeeId, updateData) => {
  if (updateData?.onboardingReview?.status === 'pending') {
    const required = [];
    const has = (obj, path) => path.split('.').reduce((o, k) => (o && o[k] !== undefined && o[k] !== null ? o[k] : undefined), obj) !== undefined;
    const check = (cond, name) => { if (!cond) required.push(name); };

    check(!!updateData.ssn, 'ssn');
    check(!!updateData.dateOfBirth, 'dateOfBirth');
    check(!!updateData.gender, 'gender');
    check(!!has(updateData, 'address.street'), 'address.street');
    check(!!has(updateData, 'address.city'), 'address.city');
    check(!!has(updateData, 'address.state'), 'address.state');
    check(!!has(updateData, 'address.zip'), 'address.zip');
    check(!!updateData.cellPhone, 'cellPhone');

    check(!!has(updateData, 'reference.firstName'), 'reference.firstName');
    check(!!has(updateData, 'reference.lastName'), 'reference.lastName');
    check(!!has(updateData, 'reference.relationship'), 'reference.relationship');

    check(Array.isArray(updateData.emergencyContacts) && updateData.emergencyContacts.length > 0, 'emergencyContacts[0]');

    check(!!updateData.citizenshipStatus, 'citizenshipStatus');
    if (updateData.citizenshipStatus === 'work_visa') {
      check(!!updateData.workAuthorizationType, 'workAuthorizationType');
      check(!!updateData.visaStartDate, 'visaStartDate');
      check(!!updateData.visaEndDate, 'visaEndDate');
      if (updateData.workAuthorizationType === 'Other') {
        check(!!updateData.visaTitle, 'visaTitle');
      }
    }

    if (required.length > 0) {
      const err = new Error(`Missing required fields: ${required.join(', ')}`);
      err.code = 'ONBOARDING_VALIDATION';
      throw err;
    }
  }

  const employee = await Employee.findByIdAndUpdate(
    employeeId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return employee;
};

export const getAllEmployees = async ({ page, limit, search, status }) => {
  let query = {};
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { preferredName: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) {
    query['onboardingReview.status'] = status;
  }
  
  const skip = (page - 1) * limit;
  
  const employees = await Employee.find(query)
    .select('-password')
    .populate('documents')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Employee.countDocuments(query);
  
  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};



export const getAllVisaStatusEmployees = async ({ page = 1, limit = 10, search } = {}) => {
  const query = { citizenshipStatus: 'work_visa' };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { preferredName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .select('firstName preferredName lastName email workAuthorizationType visaStartDate visaEndDate documents')
      .populate({
        path: 'documents',
        match: { status: 'approved' },
        select: 'type fileName fileUrl status'
      })
      .sort({ visaEndDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments(query)
  ]);

  const now = new Date();
  const list = employees.map(e => ({
    ...e,
    daysRemaining: e.visaEndDate ? Math.ceil((new Date(e.visaEndDate) - now) / 86400000) : null
  }));

  return {
    employees: list,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getEmployeesWithIncompleteOptDocs = async ({ page = 1, limit = 10, search } = {}) => {
  const { RegistrationToken } = await import('../models/RegistrationToken.js');
  const now = new Date();

  const unusedTokens = await RegistrationToken.find({
    submittedAt: { $exists: false },
    expiresAt: { $gt: now }
  })
    .select('email firstName middleName lastName createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const tokensWithNoEmployee = [];
  for (const token of unusedTokens) {
    const employeeExists = await Employee.findOne({ email: token.email });
    if (!employeeExists) {
      tokensWithNoEmployee.push({
        ...token,
        _id: token._id || `token-${token.email}`,
        isToken: true,
        onboardingReview: { status: 'never_submitted' }
      });
    }
  }

  let employeeQuery = {
    $or: [
      { 'onboardingReview.status': 'never_submitted' },
      { 'onboardingReview.status': 'pending' },
      { 'onboardingReview.status': 'rejected' },
      {
        'onboardingReview.status': 'approved',
        citizenshipStatus: 'work_visa',
        workAuthorizationType: 'F1(CPT/OPT)'
      }
    ]
  };

  if (search) {
    const searchQuery = {
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { preferredName: { $regex: search, $options: 'i' } }
      ]
    };
    employeeQuery = { $and: [employeeQuery, searchQuery] };
  }

  const employees = await Employee.find(employeeQuery)
    .select('firstName middleName lastName preferredName email workAuthorizationType visaStartDate visaEndDate citizenshipStatus documents onboardingReview')
    .populate({
      path: 'documents',
      select: 'type status fileName fileUrl hrFeedback'
    })
    .sort({ createdAt: -1 })
    .lean();

  const byType = (docs, type) => (docs || []).find(d => d.type === type);
  const state = (doc) => (doc ? doc.status : 'not_uploaded');
  const feedback = (doc) => (doc?.hrFeedback ? ` HR feedback: ${doc.hrFeedback}` : '');

  const computeNextStep = (employee) => {
    if (employee.isToken) {
      return { nextStep: 'Next step: Submit registration using the registration token link sent via email.' };
    }

    const onboardingStatus = employee.onboardingReview?.status || 'never_submitted';
    
    if (onboardingStatus === 'never_submitted') {
      return { nextStep: 'Next step: Submit onboarding application.' };
    }
    
    if (onboardingStatus === 'pending') {
      return { nextStep: 'Next step: Wait for HR to review your onboarding application.' };
    }
    
    if (onboardingStatus === 'rejected') {
      const feedbackText = employee.onboardingReview?.hrFeedback 
        ? ` HR feedback: ${employee.onboardingReview.hrFeedback}`
        : '';
      return { nextStep: `Next step: Review feedback and resubmit onboarding application.${feedbackText}` };
    }

    if (onboardingStatus === 'approved' && 
        employee.citizenshipStatus === 'work_visa' && 
        employee.workAuthorizationType === 'F1(CPT/OPT)') {
      const docs = employee.documents || [];
      
      const r = byType(docs, 'opt_receipt');
      if (state(r) === 'not_uploaded') return { nextStep: 'Next step: Please upload your OPT Receipt.' };
      if (state(r) === 'pending') return { nextStep: 'Next step: Waiting for HR to approve your OPT Receipt.', pendingDoc: r };
      if (state(r) === 'rejected') return { nextStep: `Next step: Your OPT Receipt was rejected.${feedback(r)} Please re-upload your OPT Receipt.` };

      const ead = byType(docs, 'opt_ead');
      if (state(ead) === 'not_uploaded') return { nextStep: 'Next step: Please upload a copy of your OPT EAD.' };
      if (state(ead) === 'pending') return { nextStep: 'Next step: Waiting for HR to approve your OPT EAD.', pendingDoc: ead };
      if (state(ead) === 'rejected') return { nextStep: `Next step: Your OPT EAD was rejected.${feedback(ead)} Please re-upload your OPT EAD.` };

      const i983 = byType(docs, 'i983');
      if (state(i983) === 'not_uploaded') {
        return { nextStep: 'Next step: Please download the I-983 Empty Template and Sample Template, fill it out, and upload it.' };
      }
      if (state(i983) === 'pending') return { nextStep: 'Next step: Waiting for HR to approve and sign your I-983.', pendingDoc: i983 };
      if (state(i983) === 'rejected') return { nextStep: `Next step: Your I-983 was rejected.${feedback(i983)} Please fix and re-upload your I-983.` };

      const i20 = byType(docs, 'i20');
      if (state(i20) === 'not_uploaded') return { nextStep: 'Next step: Please upload your new I-20.' };
      if (state(i20) === 'pending') return { nextStep: 'Next step: Waiting for HR to approve your I-20.', pendingDoc: i20 };
      if (state(i20) === 'rejected') return { nextStep: `Next step: Your I-20 was rejected.${feedback(i20)} Please fix and re-upload your I-20.` };

      if (state(i20) === 'approved') return { nextStep: 'All documents have been approved.' };
    }

    return { nextStep: 'Please review your status for next steps.' };
  };

  const allItems = [
    ...tokensWithNoEmployee.map(token => ({
      ...token,
      firstName: token.firstName,
      middleName: token.middleName || '',
      lastName: token.lastName,
      preferredName: '',
      email: token.email,
      workAuthorizationType: null,
      visaStartDate: null,
      visaEndDate: null,
      documents: [],
      onboardingReview: { status: 'never_submitted' }
    })),
    ...employees
  ];

  let filteredItems = allItems;
  if (search) {
    const searchLower = search.toLowerCase().trim();
    filteredItems = allItems.filter(item => {
      const firstName = (item.firstName || '').toLowerCase();
      const lastName = (item.lastName || '').toLowerCase();
      const preferredName = (item.preferredName || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      return firstName.includes(searchLower) || 
             lastName.includes(searchLower) || 
             preferredName.includes(searchLower) ||
             email.includes(searchLower);
    });
  }

  const inProgressAll = filteredItems
    .map(item => {
      const { nextStep, pendingDoc } = computeNextStep(item);
      
      let allApproved = false;
      if (item.onboardingReview?.status === 'approved' &&
          item.citizenshipStatus === 'work_visa' &&
          item.workAuthorizationType === 'F1(CPT/OPT)') {
        const docs = item.documents || [];
        allApproved =
          state(byType(docs, 'opt_receipt')) === 'approved' &&
          state(byType(docs, 'opt_ead')) === 'approved' &&
          state(byType(docs, 'i983')) === 'approved' &&
          state(byType(docs, 'i20')) === 'approved';
      }

      return {
        ...item,
        nextStep,
        pendingDoc: pendingDoc || null,
        allApproved
      };
    })
    .filter(item => !item.allApproved);

  const total = inProgressAll.length;
  const start = (page - 1) * limit;
  const list = inProgressAll.slice(start, start + limit);

  const withDays = list.map(item => ({
    ...item,
    daysRemaining: item.visaEndDate ? Math.ceil((new Date(item.visaEndDate) - now) / 86400000) : null
  }));

  return {
    employees: withDays,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getPendingVisaDocuments = async (employeeId) => {
  const employee = await Employee.findById(employeeId)
    .populate({
      path: 'documents',
      match: { status: 'pending' }
    });
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return employee.documents.filter(doc => doc.status === 'pending');
};

export const reviewVisaDocument = async (docId, reviewData) => {
  const Document = (await import('../models/Document.js')).Document;
  
  const document = await Document.findByIdAndUpdate(
    docId,
    reviewData,
    { new: true }
  );
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  return document;
};

export const sendNextStepReminder = async (employeeId) => {
  const employee = await Employee.findById(employeeId).populate('documents');

  if (!employee) {
    throw new Error('Employee not found');
  }

  if (employee.citizenshipStatus !== 'work_visa' || employee.workAuthorizationType !== 'F1(CPT/OPT)') {
    throw new Error('Reminder is only applicable to OPT (F1) work authorization');
  }

  const transporter = (await import('../config/email.js')).default;

  const byType = (type) => employee.documents.find((d) => d.type === type);
  const label = (type) => ({
    opt_receipt: 'OPT Receipt',
    opt_ead: 'OPT EAD',
    i983: 'I-983',
    i20: 'I-20'
  }[type] || type);

  const docState = (doc) => (doc ? doc.status : 'not_uploaded');
  const feedback = (doc) => (doc?.hrFeedback ? ` HR feedback: ${doc.hrFeedback}` : '');

  const frontendBase = process.env.FRONTEND_URL || '';
  const visaPageUrl = `${frontendBase}/employee/visa-status`;

  const steps = [
    {
      type: 'opt_receipt',
      on: (s) => {
        if (s === 'not_uploaded') return { subject: 'Action Required: Upload OPT Receipt', nextStep: 'Please upload your OPT Receipt.' };
        if (s === 'pending') return { subject: 'Update: Waiting for HR Approval', nextStep: 'Waiting for HR to approve your OPT Receipt.' };
        if (s === 'rejected') return { subject: 'Action Required: Re-upload OPT Receipt', nextStep: `Your OPT Receipt was rejected.${feedback(byType('opt_receipt'))} Please re-upload your OPT Receipt.` };
        return null;
      }
    },
    {
      type: 'opt_ead',
      on: (s) => {
        if (s === 'not_uploaded') return { subject: 'Action Required: Upload OPT EAD', nextStep: 'Please upload a copy of your OPT EAD.' };
        if (s === 'pending') return { subject: 'Update: Waiting for HR Approval', nextStep: 'Waiting for HR to approve your OPT EAD.' };
        if (s === 'rejected') return { subject: 'Action Required: Re-upload OPT EAD', nextStep: `Your OPT EAD was rejected.${feedback(byType('opt_ead'))} Please re-upload your OPT EAD.` };
        return null;
      }
    },
    {
      type: 'i983',
      on: (s) => {
        if (s === 'not_uploaded') {
          const templatesNote = 'Please download the I-983 Empty Template and Sample Template from your Visa Status page, fill out the form, and upload it.';
          return { subject: 'Action Required: Fill and Upload I-983', nextStep: `${templatesNote}` };
        }
        if (s === 'pending') return { subject: 'Update: Waiting for HR Approval', nextStep: 'Waiting for HR to approve and sign your I-983.' };
        if (s === 'rejected') return { subject: 'Action Required: Re-upload I-983', nextStep: `Your I-983 was rejected.${feedback(byType('i983'))} Please fix and re-upload your I-983.` };
        return null;
      }
    },
    {
      type: 'i20',
      on: (s) => {
        if (s === 'not_uploaded') return { subject: 'Action Required: Upload I-20', nextStep: 'Please upload your new I-20.' };
        if (s === 'pending') return { subject: 'Update: Waiting for HR Approval', nextStep: 'Waiting for HR to approve your I-20.' };
        if (s === 'rejected') return { subject: 'Action Required: Re-upload I-20', nextStep: `Your I-20 was rejected.${feedback(byType('i20'))} Please fix and re-upload your I-20.` };
        if (s === 'approved') return { subject: 'All Documents Approved', nextStep: 'All documents have been approved.' };
        return null;
      }
    }
  ];

  let subject = '';
  let nextStep = '';

  for (const step of steps) {
    const state = docState(byType(step.type));
    const result = step.on(state);
    if (result) {
      subject = result.subject;
      nextStep = result.nextStep;
      break;
    }

    if (step.type === 'i20' && state === 'approved') {
      subject = 'All Documents Approved';
      nextStep = 'All documents have been approved.';
    }
  }


  if (!subject || !nextStep) {
    subject = 'Visa Status Update';
    nextStep = 'Please review your visa status and documents for next steps.';
  }

  const mailOptions = {
    from: `"HR Department" <${process.env.EMAIL_USER}>`,
    to: employee.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Visa Status Reminder (OPT)</h2>
        <p>Hello ${employee.firstName} ${employee.lastName},</p>
        <p>${nextStep}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${visaPageUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Visa Status Page
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated reminder from the Employee Management System.</p>
      </div>
    `,
    text: `
Visa Status Reminder (OPT)

Hello ${employee.firstName} ${employee.lastName},

${nextStep}

Go to Visa Status Page: ${visaPageUrl}

This is an automated reminder from the Employee Management System.
    `
  };

  const info = await transporter.sendMail(mailOptions);

  return {
    message: 'Reminder sent successfully',
    emailSent: true,
    subject,
    nextStep,
    messageId: info?.messageId
  };
};