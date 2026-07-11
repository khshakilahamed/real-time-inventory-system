import express from 'express';
import { loginController, registrationController } from './auth.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { loginValidate, registrationValidate } from './auth.validation.js';

const authRouter = express.Router();

authRouter.post('/register', validateRequest(registrationValidate), registrationController);
authRouter.post('/login', validateRequest(loginValidate), loginController);

export default authRouter;