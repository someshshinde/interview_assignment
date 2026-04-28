let authenticateMock = jest.fn();

jest.mock('sequelize', () => {
  authenticateMock = jest.fn();

  return {
    Sequelize: jest.fn(() => ({
      authenticate: authenticateMock,
    })),
  };
});

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import logger from '../utils/logger';
import { dbConnection } from '../utils/db';

describe('dbConnection()', () => {
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('should connect database successfully', async () => {
    authenticateMock.mockResolvedValueOnce(true);

    await dbConnection();

    expect(authenticateMock).toHaveBeenCalledTimes(1);

    expect(logger.info).toHaveBeenCalledWith(
      'Database Connected Successfully'
    );
  });

  it('should log error and exit process when connection fails', async () => {
    authenticateMock.mockRejectedValueOnce(new Error('DB Failed'));

    await expect(dbConnection()).rejects.toThrow('process.exit called');

    expect(logger.error).toHaveBeenCalledWith(
      'Database Connection Failed',
      expect.any(Error)
    );

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});