import {
  rateLimiter,
  requests
} from './rateLimiter';

describe('rateLimiter', () => {

  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {

    requests.clear();

    req = {
      ip: '127.0.0.1'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  test(
    'should allow first request',
    () => {

      rateLimiter(req, res, next);

      expect(next)
        .toHaveBeenCalled();

      expect(
        requests.get(req.ip)?.count
      ).toBe(1);
    }
  );

  test(
    'should reset when window expired',
    () => {

      requests.set(req.ip, {
        count: 5,
        startTime:
          Date.now() - 61000
      });

      rateLimiter(req, res, next);

      expect(next)
        .toHaveBeenCalled();

      expect(
        requests.get(req.ip)?.count
      ).toBe(1);
    }
  );

  test(
    'should block after max requests',
    () => {

      requests.set(req.ip, {
        count: 10,
        startTime: Date.now()
      });

      rateLimiter(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(429);

      expect(res.json)
        .toHaveBeenCalled();

      expect(next)
        .not.toHaveBeenCalled();
    }
  );

  test(
    'should increment request count',
    () => {

      requests.set(req.ip, {
        count: 5,
        startTime: Date.now()
      });

      rateLimiter(req, res, next);

      expect(next)
        .toHaveBeenCalled();

      expect(
        requests.get(req.ip)?.count
      ).toBe(6);
    }
  );

  test(
    'should handle errors',
    () => {

      req = {};

      jest.spyOn(
        requests,
        'get'
      ).mockImplementation(() => {
        throw new Error('Test error');
      });

      rateLimiter(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(500);

      expect(res.json)
        .toHaveBeenCalledWith({
          success: false,
          message: 'Test error'
        });
    }
  );

});