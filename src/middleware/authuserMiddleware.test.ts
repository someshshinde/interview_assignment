import { Response, NextFunction } from 'express';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';
import {
  authUser,
  AuthRequest,
} from './authuserMiddleware'; 

describe('authUser()', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test_secret';
  });

  it('should return 401 when token missing', () => {
    authUser(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. Token missing',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization format invalid', () => {
    req.headers = {
      authorization: 'InvalidToken',
    };

    authUser(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid authorization format',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 when JWT secret not configured', () => {
    delete process.env.JWT_SECRET;

    req.headers = {
      authorization: 'Bearer abc123',
    };

    authUser(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'JWT secret not configured',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should verify token, attach user, and call next()', () => {
    req.headers = {
      authorization: 'Bearer validtoken',
    };

    (jwt.verify as jest.Mock).mockReturnValueOnce({
      id: 1,
      email: 'test@mail.com',
      role: 'ADMIN',
    });

    authUser(req as AuthRequest, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      'test_secret'
    );

    expect(req.user).toEqual({
      id: 1,
      email: 'test@mail.com',
      role: 'ADMIN',
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return 401 when token is invalid', () => {
    req.headers = {
      authorization: 'Bearer invalidtoken',
    };

    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    authUser(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or expired token',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Bearer prefix is lowercase', () => {
    req.headers = {
      authorization: 'bearer token123',
    };

    authUser(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid authorization format',
    });
  });
});