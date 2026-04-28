import { Request, Response } from 'express';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../models/user', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import user from '../../models/user';
import logger from '../../utils/logger';
import { login } from './login';

describe('login()', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test_secret';
  });

  it('should return 400 if email or password missing', async () => {
    req.body = {};

    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Email and password are required',
    });
  });

  it('should return 401 if user not found', async () => {
    req.body = {
      email: 'test@mail.com',
      password: '123456',
    };

    (user.findOne as jest.Mock).mockResolvedValueOnce(null);

    await login(req as Request, res as Response);

    expect(user.findOne).toHaveBeenCalledWith({
      where: { email: 'test@mail.com' },
    });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid credentials',
    });
  });

  it('should return 401 if password does not match', async () => {
    req.body = {
      email: 'test@mail.com',
      password: 'wrongpass',
    };

    const mockUser = {
      getDataValue: jest.fn((field: string) => {
        if (field === 'password') return 'hashedPassword';
      }),
    };

    (user.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await login(req as Request, res as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrongpass',
      'hashedPassword'
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 200 with token when login successful', async () => {
    req.body = {
      email: 'test@mail.com',
      password: '123456',
    };

    const mockUser = {
      getDataValue: jest.fn((field: string) => {
        const values: Record<string, any> = {
          id: 1,
          name: 'Somesh',
          email: 'test@mail.com',
          role: 'admin',
          password: 'hashedPassword',
        };

        return values[field];
      }),
    };

    (user.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (jwt.sign as jest.Mock).mockReturnValueOnce('mock_token');

    await login(req as Request, res as Response);

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: 1,
        email: 'test@mail.com',
        role: 'admin',
      },
      'test_secret',
      { expiresIn: '1d' }
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Login successful',
      token: 'mock_token',
      user: {
        id: 1,
        name: 'Somesh',
        email: 'test@mail.com',
        role: 'admin',
      },
    });
  });

  it('should return 500 when exception occurs', async () => {
    req.body = {
      email: 'test@mail.com',
      password: '123456',
    };

    (user.findOne as jest.Mock).mockRejectedValueOnce(
      new Error('DB Error')
    );

    await login(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Login failed',
    });
  });
});