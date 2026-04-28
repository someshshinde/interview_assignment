import { Request, Response } from 'express';

jest.mock('../../utils/db', () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn(),
  },
}));

import db from '../../utils/db';
import { healthcheck } from './health';

describe('healthcheck()', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return 200 when database is healthy', async () => {
    (db.authenticate as jest.Mock).mockResolvedValueOnce(true);

    await healthcheck(req as Request, res as Response);

    expect(db.authenticate).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 'healthy',
        message: 'Service is running',
        services: {
          api: 'up',
          database: 'up',
        },
      })
    );
  });

  it('should return 503 when database is down', async () => {
    (db.authenticate as jest.Mock).mockRejectedValueOnce(
      new Error('DB Failed')
    );

    await healthcheck(req as Request, res as Response);

    expect(db.authenticate).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(503);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 'unhealthy',
        message: 'Service degraded',
        services: {
          api: 'up',
          database: 'down',
        },
      })
    );
  });

  it('should include uptimeSeconds and memory in success response', async () => {
    (db.authenticate as jest.Mock).mockResolvedValueOnce(true);

    await healthcheck(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        uptimeSeconds: expect.any(Number),
        responseTimeMs: expect.any(Number),
        memory: expect.objectContaining({
          rss: expect.any(Number),
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
        }),
      })
    );
  });

  it('should default environment to development', async () => {
    (db.authenticate as jest.Mock).mockResolvedValueOnce(true);

    delete process.env.NODE_ENV;

    await healthcheck(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'development',
      })
    );
  });
});