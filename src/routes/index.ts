import express, { Request, Response } from 'express';
import { login } from '../controllers/login/login';
import { visibilityMiddleware } from '../middleware/visibilityMiddleware';
import { authUser } from '../middleware/authuserMiddleware';
import db from '../utils/db';
import {healthcheck} from '../controllers/health/health'
import {register} from '../controllers/register/register'
import {createTask,taskList} from '../controllers/task/task'


const router = express.Router();

router.get('/health', healthcheck);

router.post('/auth/login', login);
router.post('/auth/register',register);

router.post('/task/create',authUser,createTask);
router.get('/task',authUser,taskList);


router.get('/tasks', visibilityMiddleware, (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Tasks fetched successfully',
    filters: req.query
  });
});

export default router;