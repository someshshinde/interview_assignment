import { Response, NextFunction } from 'express';
import {
  visibilityMiddleware,
  AuthRequest,
} from './visibilityMiddleware';

describe('visibilityMiddleware()', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it('should return 401 when user is missing', () => {
    visibilityMiddleware(
      req as AuthRequest,
      res as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should set reported_by for USER role', () => {
    req.user = {
      id: 10,
      role: 'USER',
    };

    visibilityMiddleware(
      req as AuthRequest,
      res as Response,
      next
    );

    expect(req.query?.reported_by).toBe('10');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set assigned_to for TECHNICIAN role', () => {
    req.user = {
      id: 20,
      role: 'TECHNICIAN',
    };

    visibilityMiddleware(
      req as AuthRequest,
      res as Response,
      next
    );

    expect(req.query?.assigned_to).toBe('20');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should allow MANAGER without modifying query', () => {
    req.user = {
      id: 30,
      role: 'MANAGER',
    };

    visibilityMiddleware(
      req as AuthRequest,
      res as Response,
      next
    );

    expect(req.query).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return 403 for invalid role', () => {
    req.user = {
      id: 99,
      role: 'ADMIN' as any,
    };

    visibilityMiddleware(
      req as AuthRequest,
      res as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 when unexpected error occurs', () => {
    req = {
      user: {
        id: 1,
        role: 'USER',
      },
      query: undefined as any,
    };

    visibilityMiddleware(
      req as AuthRequest,
      res as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Visibility middleware failed',
    });

    expect(next).not.toHaveBeenCalled();
  });
});