import { Request, Response } from 'express';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../../models/task', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

jest.mock('../../utils/helper', () => ({
  generateTaskCode: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

import { validationResult } from 'express-validator';
import Task from '../../models/task';
import { generateTaskCode } from '../../utils/helper';
import logger from '../../utils/logger';

import {
  createTask,
  taskList,
} from './task';

describe('Task Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const mockedValidationResult =
    validationResult as unknown as jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });


  describe('createTask()', () => {
    it('should return 400 when validation fails', async () => {
      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [{ msg: 'Title required' }],
      });

      await createTask(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create task successfully', async () => {
      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      });

      req.body = {
        title: 'Motor Issue',
        description: 'Machine stopped',
        priority: 'HIGH',
        machine_id: 10,
        assigned_to: 5,
      };

      (req as any).user = { id: 1 };

      (generateTaskCode as jest.Mock).mockReturnValueOnce(
        'TSK-1234-ABC'
      );

      (Task.create as jest.Mock).mockResolvedValueOnce({
        id: 1,
      });

      await createTask(req as Request, res as Response);

      expect(Task.create).toHaveBeenCalledWith({
        code: 'TSK-1234-ABC',
        title: 'Motor Issue',
        description: 'Machine stopped',
        status: 'REPORTED',
        priority: 'HIGH',
        machine_id: 10,
        reported_by: 1,
        assigned_to: 5,
        approved_by: null,
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should use default MEDIUM priority', async () => {
      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      });

      req.body = {
        title: 'Issue',
        machine_id: 1,
      };

      (req as any).user = { id: 7 };

      (generateTaskCode as jest.Mock).mockReturnValueOnce(
        'TSK-2222-ZZZ'
      );

      (Task.create as jest.Mock).mockResolvedValueOnce({});

      await createTask(req as Request, res as Response);

      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'MEDIUM',
        })
      );
    });

    it('should return 500 when create task fails', async () => {
      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      });

      (req as any).user = { id: 1 };
      req.body = { title: 'Issue' };

      (generateTaskCode as jest.Mock).mockReturnValueOnce(
        'TSK-1111-AAA'
      );

      (Task.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB Error')
      );

      await createTask(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('taskList()', () => {
    it('should fetch task list for ADMIN', async () => {
      (req as any).user = {
        id: 1,
        role: 'ADMIN',
      };

      req.query = {
        page: '1',
        limit: '10',
      };

      (Task.findAndCountAll as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1 }],
        count: 1,
      });

      await taskList(req as Request, res as Response);

      expect(Task.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']],
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter USER tasks by reported_by', async () => {
      (req as any).user = {
        id: 10,
        role: 'USER',
      };

      (Task.findAndCountAll as jest.Mock).mockResolvedValueOnce({
        rows: [],
        count: 0,
      });

      await taskList(req as Request, res as Response);

      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            reported_by: 10,
          },
        })
      );
    });

    it('should filter TECHNICIAN tasks by assigned_to', async () => {
      (req as any).user = {
        id: 20,
        role: 'TECHNICIAN',
      };

      (Task.findAndCountAll as jest.Mock).mockResolvedValueOnce({
        rows: [],
        count: 0,
      });

      await taskList(req as Request, res as Response);

      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            assigned_to: 20,
          },
        })
      );
    });

    it('should apply status and priority filters', async () => {
      (req as any).user = {
        id: 1,
        role: 'ADMIN',
      };

      req.query = {
        status: 'OPEN',
        priority: 'HIGH',
      };

      (Task.findAndCountAll as jest.Mock).mockResolvedValueOnce({
        rows: [],
        count: 0,
      });

      await taskList(req as Request, res as Response);

      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'OPEN',
            priority: 'HIGH',
          },
        })
      );
    });

    it('should return 500 when fetch fails', async () => {
      (req as any).user = {
        id: 1,
        role: 'ADMIN',
      };

      (Task.findAndCountAll as jest.Mock).mockRejectedValueOnce(
        new Error('DB Error')
      );

      await taskList(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});