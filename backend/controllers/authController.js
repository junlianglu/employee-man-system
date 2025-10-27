import * as authService from '../services/authService.js';

export const loginEmployeeController = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    const result = await authService.loginEmployee({ username, password });

    res.status(200).json({
      message: 'Login successful',
      ...result
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid username or password') {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
};

export const getCurrentEmployeeController = async (req, res) => {
  try {
    const employeeId = req.employee.id;

    const employee = await authService.getCurrentEmployee(employeeId);

    res.status(200).json({
      message: 'Employee profile retrieved successfully',
      employee
    });

  } catch (error) {
    console.error('Get current employee error:', error);
    
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};