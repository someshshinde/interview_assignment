import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  count: number;
  startTime: number;
}

export const requests = new Map<string, RateLimitData>();

const WINDOW_TIME = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    const user = requests.get(ip);

    // First request
    if (!user) {
      requests.set(ip, {
        count: 1,
        startTime: now
      });

      return next();
    }

    // Reset after window expires
    if (now - user.startTime > WINDOW_TIME) {
      requests.set(ip, {
        count: 1,
        startTime: now
      });

      return next();
    }

    // Block
    if (user.count >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Try again later.'
      });
    }

    // Increment
    user.count++;

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Internal server error'
    });
  }
};