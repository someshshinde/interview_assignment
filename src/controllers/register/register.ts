import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../../models/user';
import logger from '../../utils/logger';

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
   
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER'
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.getDataValue('id'),
        name: newUser.getDataValue('name'),
        email: newUser.getDataValue('email'),
        role: newUser.getDataValue('role')
      }
    });

  } catch (error) {
    logger.error('error',error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};