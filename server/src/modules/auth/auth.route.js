import express from 'express';
import { loginController, registrationController } from './auth.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { loginSchema, registrationSchema } from './auth.validation.js';

const authRouter = express.Router();

authRouter.post('/register', validateRequest(registrationSchema), registrationController);
authRouter.post('/login', validateRequest(loginSchema), loginController);

export default authRouter;