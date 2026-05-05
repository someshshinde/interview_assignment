import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: 'USER' | 'MANAGER' | 'TECHNICIAN';
  };
}

export const visibilityMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { id, role } = req.user;

    switch (role) {
      case 'USER':
        
        break;

      case 'TECHNICIAN':
        req.query.assigned_to = id.toString();
        break;

      case 'MANAGER':
       req.query.reported_by = id.toString();
       break;

      default:
        return res.status(403).json({
          success: false,
          message: 'Forbidden'
        });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Visibility middleware failed'
    });
  }
};