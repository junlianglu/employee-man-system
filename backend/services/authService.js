import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee.js';
import { comparePassword } from '../utils/hashPassword.js';

export const loginEmployee = async ({ username, password }) => {
  const employee = await Employee.findOne({ username });
  
  if (!employee) {
    throw new Error('Invalid username or password');
  }

  const isPasswordValid = await comparePassword({ 
    password, 
    hashedPassword: employee.password 
  });

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  const token = jwt.sign(
    {
      id: employee._id,
      email: employee.email,
      username: employee.username,
      isHR: employee.isHR
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...employeeData } = employee.toObject();
  
  return {
    employee: employeeData,
    token
  };
};

export const getCurrentEmployee = async (employeeId) => {
  const employee = await Employee.findById(employeeId).select('-password');
  
  if (!employee) {
    throw new Error('Employee not found');
  }

  return employee;
};