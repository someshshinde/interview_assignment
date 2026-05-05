jest.mock('../../utils/db', () => ({
  __esModule: true,
  default: {}
}));

jest.mock('../../models/task', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn()
  }
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));

jest.mock('../../utils/helper', () => ({
  generateTaskCode: jest.fn()
}));

jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));


import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { generateTaskCode } from '../../utils/helper';

import Task from '../../models/task';

import {
  createTask,
  taskList,
  taskApprove,
  requestMaterials
} from './task';


const mockedTask = Task as jest.Mocked<typeof Task>;

const mockResponse = () => {
  const res: Partial<Response> = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res as Response;
};
const mockedGenerateTaskCode =
  generateTaskCode as jest.Mock;

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('validation fail', async () => {
      (validationResult as any).mockReturnValue({
        isEmpty: () => false,
        array: () => ['error']
      });

      const req = {} as Request;
      const res = mockResponse();

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('USER creates task', async () => {
      (validationResult as any).mockReturnValue({
        isEmpty: () => true
      });

      mockedGenerateTaskCode.mockReturnValue('T001');

      mockedTask.create.mockResolvedValue({} as any);

      const req = {
        body: {},
        user: {
          id: 1,
          role: 'USER'
        }
      } as any;

      const res = mockResponse();

      await createTask(req, res);

      expect(mockedTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'REPORTED'
        })
      );
    });

    it('TECHNICIAN creates task', async () => {
      (validationResult as any).mockReturnValue({
        isEmpty: () => true
      });

      mockedGenerateTaskCode.mockReturnValue('T001');

      mockedTask.create.mockResolvedValue({} as any);

      const req = {
        body: {},
        user: {
          id: 1,
          role: 'TECHNICIAN'
        }
      } as any;

      const res = mockResponse();

      await createTask(req, res);

      expect(mockedTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'IN_PROGRESS'
        })
      );
    });

    it('createTask exception', async () => {
      (validationResult as any).mockImplementation(() => {
        throw new Error();
      });

      const req = {} as Request;
      const res = mockResponse();

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('taskList', () => {
    const statuses = [
      'REPORTED',
      'PENDING',
      'APPROVED',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED',
      'CANCELLED',
      'UNKNOWN'
    ];

    test.each(statuses)(
      'status %s branch',
      async (status) => {
        mockedTask.findAndCountAll.mockResolvedValue({
          count: 1,
          rows: [
            {
              dataValues: { status },
              toJSON: () => ({ status })
            }
          ]
        } as any);

        const req = {
          query: {
            id: '1',
            status,
            priority: 'HIGH'
          },
          user: {
            id: 1,
            role: 'USER'
          }
        } as any;

        const res = mockResponse();

        await taskList(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
      }
    );

    it('TECHNICIAN branch', async () => {
      mockedTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      } as any);

      const req = {
        query: {},
        user: {
          id: 1,
          role: 'TECHNICIAN'
        }
      } as any;

      const res = mockResponse();

      await taskList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('taskList exception', async () => {
      mockedTask.findAndCountAll.mockRejectedValue(
        new Error()
      );

      const req = {
        query: {},
        user: {
          role: 'USER'
        }
      } as any;

      const res = mockResponse();

      await taskList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('taskApprove', () => {
    it('not manager', async () => {
      const req = {
        user: {
          role: 'USER'
        },
        params: {}
      } as any;

      const res = mockResponse();

      await taskApprove(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('invalid status', async () => {
      const req = {
        user: {
          role: 'MANAGER'
        },
        params: {
          status: 'BAD'
        }
      } as any;

      const res = mockResponse();

      await taskApprove(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('task not found', async () => {
      mockedTask.findOne.mockResolvedValue(null);

      const req = {
        user: {
          role: 'MANAGER'
        },
        params: {
          taskcode: 'T001',
          status: 'APPROVED'
        }
      } as any;

      const res = mockResponse();

      await taskApprove(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('success', async () => {
      const task = {
        update: jest.fn(),
        reload: jest.fn()
      };

      mockedTask.findOne.mockResolvedValue(
        task as any
      );

      const req = {
        user: {
          id: 1,
          role: 'MANAGER'
        },
        params: {
          taskcode: 'T001',
          status: 'APPROVED'
        }
      } as any;

      const res = mockResponse();

      await taskApprove(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('exception', async () => {
      mockedTask.findOne.mockRejectedValue(
        new Error()
      );

      const req = {
        user: {
          role: 'MANAGER'
        },
        params: {
          taskcode: 'T001',
          status: 'APPROVED'
        }
      } as any;

      const res = mockResponse();

      await taskApprove(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('requestMaterials', () => {
    it('not technician', async () => {
      const req = {
          params: {},
          body: {},
          user: {
            role: 'USER'
          }
        } as any;

      const res = mockResponse();

      await requestMaterials(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('task not found', async () => {
      mockedTask.findOne.mockResolvedValue(null);

      const req = {
        params: {
          taskcode: 'T001'
        },
        body: {},
        user: {
          role: 'TECHNICIAN'
        }
      } as any;

      const res = mockResponse();

      await requestMaterials(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('not assigned', async () => {
      mockedTask.findOne.mockResolvedValue({
        getDataValue: () => 99
      } as any);

      const req = {
        params: {
          taskcode: 'T001'
        },
        body: {},
        user: {
          id: 1,
          role: 'TECHNICIAN'
        }
      } as any;

      const res = mockResponse();

      await requestMaterials(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('success', async () => {
      const task = {
        getDataValue: () => 1,
        update: jest.fn(),
        reload: jest.fn()
      };

      mockedTask.findOne.mockResolvedValue(
        task as any
      );

       const req = {
        params: {
          taskcode: 'T001'
        },
        body: {
          materialsRequested: ['motor'],
          reason: 'damaged',
          assignedTo: 2
        },
        user: {
          id: 1,
          role: 'TECHNICIAN'
        }
      } as any;

      const res = mockResponse();

      await requestMaterials(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('exception', async () => {
      mockedTask.findOne.mockRejectedValue(
        new Error()
      );

      const req = {
        user: {
          role: 'TECHNICIAN'
        }
      } as any;

      const res = mockResponse();

      await requestMaterials(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});