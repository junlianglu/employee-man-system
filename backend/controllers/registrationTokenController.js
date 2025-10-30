import * as registrationTokenService from '../services/registrationTokenService.js';

export const generateRegistrationTokenController = async (req, res) => {
  try {
    const { email, firstName, middleName, lastName } = req.body;
    
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, first name, and last name are required' 
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const registrationToken = await registrationTokenService.generateRegistrationToken({
      email,
      firstName,
      middleName,
      lastName
    });
    
    await registrationTokenService.sendRegistrationEmail(registrationToken);
    
    res.status(201).json({
      message: 'Registration token generated and email sent successfully',
      token: registrationToken.toObject()
    });
    
  } catch (error) {
    console.error('Generate token error:', error);
    
    if (error.message.includes('duplicate key') || error.message.includes('unique')) {
      return res.status(409).json({ error: 'Token already exists for this email' });
    }
    
    res.status(500).json({ error: 'Failed to generate registration token' });
  }
};

export const getAllRegistrationTokensController = async (req, res) => {
  try {
    const tokens = await registrationTokenService.getAllRegistrationTokens();
    
    res.status(200).json({
      message: 'Registration tokens retrieved successfully',
      tokens
    });
    
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Failed to retrieve registration tokens' });
  }
};

export const validateRegistrationTokenController = async (req, res) => {
  try {
    const { token } = req.params;
    
    const registrationToken = await registrationTokenService.validateRegistrationToken(token);
    
    res.status(200).json({
      message: 'Registration token is valid',
      email: registrationToken.email,
      firstName: registrationToken.firstName,
      middleName: registrationToken.middleName,
      lastName: registrationToken.lastName
    });
    
  } catch (error) {
    console.error('Validate token error:', error);
    
    if (error.message === 'Invalid registration token') {
      return res.status(404).json({ error: 'Invalid registration token' });
    }
    
    if (error.message === 'Registration token has expired') {
      return res.status(410).json({ error: 'Registration token has expired' });
    }
    
    if (error.message === 'This registration token has already been used') {
      return res.status(409).json({ error: 'This registration token has already been used' });
    }
    
    if (error.message === 'An account with this email already exists') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    
    res.status(500).json({ error: 'Failed to validate registration token' });
  }
};

export const completeRegistrationController = async (req, res) => {
  try {
    const { token } = req.params;
    const employeeData = req.body;
    
    if (!employeeData?.username || !employeeData?.password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const employee = await registrationTokenService.completeRegistration(token, employeeData);
    
    res.status(201).json({
      message: 'Registration completed successfully',
      employee: {
        _id: employee._id,
        email: employee.email,
        username: employee.username,
        firstName: employee.firstName,
        lastName: employee.lastName
      }
    });
    
  } catch (error) {
    console.error('Complete registration error:', error);
    
    if (error.message === 'Invalid registration token') {
      return res.status(404).json({ error: 'Invalid registration token' });
    }
    
    if (error.message === 'Registration token has expired') {
      return res.status(410).json({ error: 'Registration token has expired' });
    }
    
    if (error.message === 'This registration token has already been used') {
      return res.status(409).json({ error: 'This registration token has already been used' });
    }
    
    if (error.message === 'An account with this email already exists') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    
    if (error.message.includes('unique')) {
      return res.status(409).json({ 
        error: 'Username already exists. Please choose a different username.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to complete registration' });
  }
};