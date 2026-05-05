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
        status: authUser.role === 'USER'?'REPORTED':'IN_PROGRESS',
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
        const tasksWithInfo = rows.map(task => {
        let additionalInfo = {};
       
        switch(task.dataValues.status){
            case 'REPORTED':
                additionalInfo = {
                    message: 'Issue reported, waiting for manager approval',
                    next_steps: 'Manager will review and assign a technician'
                };
            break;
            case 'PENDING':
                additionalInfo = {
                    message: 'Task pending approval or waiting for materials',
                    next_steps: 'Waiting for manager action or material approval'
                };
            break;
            case 'APPROVED':
                additionalInfo = {
                    message: 'Task approved and assigned to technician',
                    next_steps: 'Technician will start working on the issue'
                };
            break;
            case 'IN_PROGRESS':
                additionalInfo = {
                    message: 'Technician is working on the issue',
                    next_steps: 'Check back later for completion status'
                };
            break;
            case 'COMPLETED':
                additionalInfo = {
                    message: 'Issue has been resolved',
                    next_steps: 'Task is complete'
                };
            break;
            case 'REJECTED':
                additionalInfo = {
                    message: 'Issue was rejected',
                    next_steps: 'Please contact support for more information'
                };
            break;
            case 'CANCELLED':
                additionalInfo = {
                    message: 'Task was cancelled',
                    next_steps: 'No further action required'
                };
            break;
            default:
                additionalInfo = {
                    message: 'Task status unknown',
                    next_steps: 'Contact support for clarification'
                };
            }
            return {
                ...task.toJSON(),
                additional_info: additionalInfo
            };
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
        data: tasksWithInfo
        });

    } catch (error) {
        logger.error('Task list fetch failed', error);

        return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks'
        });
    }
};

export const taskApprove = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const authUser = (req as any).user;
            
            const { taskcode,status,assignedTo } = req.params;
        
            
             if (authUser.role !== 'MANAGER') {
                return res.status(403).json({
                    success: false,
                    message: 'Only manager can approve tasks'
                });
            }

            const statusValue = status as string;
            const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED','CANCELLED'];
            if (!allowedStatuses.includes(statusValue)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
                });
            }
            
        
            if (!taskcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Task code is required'
                });
            }

            const task = await Task.findOne({ where: { code: taskcode } });
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }
            
            const updateData: any = {
                approved_by: authUser.id,
                assigned_to:assignedTo
            };
            
            if (statusValue) {
                updateData.status = statusValue
            }
            
            await task.update(updateData);
            await task.reload();
            
            return res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: task
            });
            
        } catch (error) {
            logger.error('Task update failed', error);
            
            return res.status(500).json({
                success: false,
                message: 'Failed to update tasks'
            });
        }
};

export const requestMaterials = async (
    req: Request,
    res: Response
    ): Promise<Response> => {
        try {
            const authUser = (req as any).user;
            const { taskcode } = req.params;
            const { materialsRequested, reason,assignedTo } = req.body;
            
        
            if (authUser.role !== 'TECHNICIAN') {
                return res.status(403).json({
                    success: false,
                    message: 'Only technicians can request materials'
                });
            }
            
            const task = await Task.findOne({ where: { code: taskcode } });
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }
            
            if (task.getDataValue('assigned_to')!== authUser.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Task not assigned to you'
                });
            }
            
            await task.update({
                status: 'PENDING', // Back to pending for manager approval
                materials_requested: materialsRequested,
                material_request_reason: reason,
                requested_by: authUser.id,
                assigned_to:assignedTo,
                requested_at: new Date()
            });
            
            await task.reload();
            
            return res.status(200).json({
                success: true,
                message: 'Materials requested successfully. Task sent back to manager for approval.',
                data: task
            });
            
        } catch (error) {
            logger.error('Material request failed', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to request materials'
            });
        }
};



