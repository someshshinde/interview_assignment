

import { Request, Response } from 'express';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../../models/user', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../../models/user';
import logger from '../../utils/logger';
import { register } from './register'; 

describe('register()', () => {
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
  });

  it('should return 400 when validation fails', async () => {
    req.body = {};

    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [
        { msg: 'Email is required' },
      ],
    });

    await register(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: [{ msg: 'Email is required' }],
    });
  });

  it('should return 409 when email already exists', async () => {
    req.body = {
      name: 'Somesh',
      email: 'test@mail.com',
      password: '123456',
    };

    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    (User.findOne as jest.Mock).mockResolvedValueOnce({
      id: 1,
    });

    await register(req as Request, res as Response);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: 'test@mail.com' },
    });

    expect(res.status).toHaveBeenCalledWith(409);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Email already registered',
    });
  });

  it('should register user successfully', async () => {
    req.body = {
      name: 'Somesh',
      email: 'test@mail.com',
      password: '123456',
      role: 'ADMIN',
    };

    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

    const createdUser = {
      getDataValue: jest.fn((field: string) => {
        const data: Record<string, any> = {
          id: 1,
          name: 'Somesh',
          email: 'test@mail.com',
          role: 'ADMIN',
        };

        return data[field];
      }),
    };

    (User.create as jest.Mock).mockResolvedValueOnce(createdUser);

    await register(req as Request, res as Response);

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);

    expect(User.create).toHaveBeenCalledWith({
      name: 'Somesh',
      email: 'test@mail.com',
      password: 'hashedPassword',
      role: 'ADMIN',
    });

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'User registered successfully',
      data: {
        id: 1,
        name: 'Somesh',
        email: 'test@mail.com',
        role: 'ADMIN',
      },
    });
  });

  it('should assign USER role when role not provided', async () => {
    req.body = {
      name: 'Somesh',
      email: 'test@mail.com',
      password: '123456',
    };

    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

    (User.create as jest.Mock).mockResolvedValueOnce({
      getDataValue: jest.fn((field: string) => {
        const data: Record<string, any> = {
          id: 1,
          name: 'Somesh',
          email: 'test@mail.com',
          role: 'USER',
        };

        return data[field];
      }),
    });

    await register(req as Request, res as Response);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'USER',
      })
    );
  });

  it('should return 500 when exception occurs', async () => {
    req.body = {
      email: 'test@mail.com',
    };

    (validationResult as unknown as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Unexpected Error');
    });

    await register(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Registration failed',
    });
  });
});