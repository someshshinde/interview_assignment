import db from '../../utils/db';
import  { Request, Response } from 'express';

export const healthcheck = async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    
    await db.authenticate();

    const uptime = process.uptime();
    const memory = process.memoryUsage();

    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'Service is running',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(uptime),
      responseTimeMs: Date.now() - start,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        api: 'up',
        database: 'up'
      },
      memory: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal
      }
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Service degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: 'down'
      }
    });
  }
}