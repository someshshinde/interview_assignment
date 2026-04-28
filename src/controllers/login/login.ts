import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import user from '../../models/user';
import logger from '../../utils/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const userdata = await user.findOne({
      where: { email }
    });

    if (!userdata) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      userdata.getDataValue('password')
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: userdata.getDataValue('id'),
        email: userdata.getDataValue('email'),
        role: userdata.getDataValue('role')
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userdata.getDataValue('id'),
        name: userdata.getDataValue('name'),
        email: userdata.getDataValue('email'),
        role: userdata.getDataValue('role')
      }
    });

  } catch (error) {
    logger.error('error',error);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};