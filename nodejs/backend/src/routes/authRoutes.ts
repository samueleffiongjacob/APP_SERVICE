import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { validateBody } from '../middleware/validate';
import { signupSchema, loginSchema } from '../dto/authDto';

export function authRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/signup', validateBody(signupSchema), controller.signup);
  router.post('/login', validateBody(loginSchema), controller.login);

  return router;
}
