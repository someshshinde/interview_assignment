import { Request, Response, NextFunction } from 'express';
import {
  visibilityMiddleware,
  AuthRequest
} from './visibilityMiddleware';

describe('visibilityMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  it('should return 401 when user is missing', () => {
    visibilityMiddleware(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized'
    });

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow USER role', () => {
    mockReq.user = {
      id: 1,
      role: 'USER'
    };

    visibilityMiddleware(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.query).toEqual({});
  });

  it('should set assigned_to for TECHNICIAN', () => {
    mockReq.user = {
      id: 10,
      role: 'TECHNICIAN'
    };

    visibilityMiddleware(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockReq.query).toEqual({
      assigned_to: '10'
    });

    expect(mockNext).toHaveBeenCalled();
  });

  it('should set reported_by for MANAGER', () => {
    mockReq.user = {
      id: 20,
      role: 'MANAGER'
    };

    visibilityMiddleware(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockReq.query).toEqual({
      reported_by: '20'
    });

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 403 for invalid role', () => {
    mockReq.user = {
      id: 1,
      role: 'ADMIN' as any
    };

    visibilityMiddleware(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(403);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden'
    });

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 when exception occurs', () => {
    mockReq.user = {
      id: 1,
      role: 'TECHNICIAN'
    };

    Object.defineProperty(mockReq, 'query', {
      get() {
        throw new Error('Mock error');
      }
    });

    visibilityMiddleware(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Visibility middleware failed'
    });

    expect(mockNext).not.toHaveBeenCalled();
  });
});