import crypto from 'crypto';
import { RegistrationToken } from '../models/RegistrationToken.js';
import { Employee } from '../models/Employee.js';
import { hashPassword } from '../utils/hashPassword.js';
import transporter from '../config/email.js';

export const generateRegistrationToken = async ({ email, firstName, middleName, lastName }) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  const registrationLink = `${process.env.FRONTEND_URL}/register/${token}`;
  
  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
  
  const registrationToken = new RegistrationToken({
    email,
    firstName,
    middleName: middleName || '',
    lastName,
    token,
    registrationLink,
    expiresAt
  });
  
  await registrationToken.save();
  
  return registrationToken;
};

export const sendRegistrationEmail = async (registrationToken) => {
  try {
    const mailOptions = {
      from: `"Employee Management System" <${process.env.EMAIL_USER}>`,
      to: registrationToken.email,
      subject: 'Complete Your Employee Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Company!</h2>
          
          <p>Hello ${registrationToken.firstName} ${registrationToken.lastName},</p>
          
          <p>You have been invited to join our team. Please complete your registration by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationToken.registrationLink}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Registration
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #007bff; word-break: break-all;">${registrationToken.registrationLink}</p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Note:</strong> This link will expire in 3 hours for security reasons.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you did not request this registration, please ignore this email.
          </p>
        </div>
      `,
      text: `
        Hello ${registrationToken.firstName} ${registrationToken.lastName},
        
        You have been invited to join our team. Please complete your registration by visiting this link:
        
        ${registrationToken.registrationLink}
        
        This link will expire in 3 hours for security reasons.
        
        If you did not request this registration, please ignore this email.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Registration email sent successfully to:', registrationToken.email);
    console.log('Message ID:', info.messageId);
    
    return true;
    
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw new Error('Failed to send registration email');
  }
};

export const getAllRegistrationTokens = async () => {
  const tokens = await RegistrationToken.find()
    .sort({ createdAt: -1 })
    .lean();
  
  return tokens;
};

export const validateRegistrationToken = async (token) => {
  const registrationToken = await RegistrationToken.findOne({ token });
  
  if (!registrationToken) {
    throw new Error('Invalid registration token');
  }
  
  if (new Date() > registrationToken.expiresAt) {
    throw new Error('Registration token has expired');
  }
  
  if (registrationToken.submittedAt) {
    throw new Error('This registration token has already been used');
  }
  
  const existingEmployee = await Employee.findOne({ email: registrationToken.email });
  if (existingEmployee) {
    throw new Error('An account with this email already exists');
  }
  
  return registrationToken;
};

export const completeRegistration = async (token, employeeData) => {
  const registrationToken = await validateRegistrationToken(token);

  if (!employeeData?.username || !employeeData?.password) {
    throw new Error('Username and password are required');
  }
  
  const hashedPassword = await hashPassword(employeeData.password);
  
  const employee = new Employee({
    email: registrationToken.email,
    username: employeeData.username,
    password: hashedPassword,
    isHR: false,
    firstName: registrationToken.firstName,
    middleName: registrationToken.middleName,
    lastName: registrationToken.lastName,
    // onboardingReview defaults to never_submitted per schema
  });
  
  await employee.save();
  
  registrationToken.submittedAt = new Date();
  await registrationToken.save();
  
  return employee;
};