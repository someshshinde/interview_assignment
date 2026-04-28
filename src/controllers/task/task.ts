import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Task from '../../models/task';
import { generateTaskCode } from '../../utils/helper';
import logger from '../../utils/logger';

export const createTask = async (
    req: Request,
    res: Response
    ): Promise<Response> => {
    try {
       
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
        }

        const {
        title,
        description,
        priority,
        machine_id,
        assigned_to
        } = req.body;

    

        const taskCode = generateTaskCode();
        const authUser = (req as any).user;
        
        const task = await Task.create({
        code: taskCode,
        title,
        description,
        status: 'REPORTED',
        priority: priority || 'MEDIUM',
        machine_id,
        reported_by: authUser.id,
        assigned_to: assigned_to || null,
        approved_by: null
        });

        return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
        });

    } catch (error) {
        logger.error('Create task failed', error);

        return res.status(500).json({
        success: false,
        message: 'Failed to create task'
        });
    }
};


export const taskList = async (
    req: Request,
    res: Response
    ): Promise<Response> => {
    try {
        const authUser = (req as any).user;

        const {
        id= '',
        page = '1',
        limit = '10',
        status='',
        priority=''
        } = req.query;

        const pageNumber = Number(page);
        const pageSize = Number(limit);
        const offset = (pageNumber - 1) * pageSize;

        const whereClause: any = {};

        if (authUser.role === 'USER') {
        whereClause.reported_by = authUser.id;
        }

        if (authUser.role === 'TECHNICIAN') {
        whereClause.assigned_to = authUser.id;
        }
        if(id)
        {
            whereClause.id = id;
        }

        if (status) {
        whereClause.status = status;
        }

        if (priority) {
        whereClause.priority = priority;
        }

        const { rows, count } = await Task.findAndCountAll({
        where: whereClause,
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
        success: true,
        message: 'Task list fetched successfully',
        pagination: {
            total: count,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(count / pageSize)
        },
        data: rows
        });

    } catch (error) {
        logger.error('Task list fetch failed', error);

        return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks'
        });
    }
};