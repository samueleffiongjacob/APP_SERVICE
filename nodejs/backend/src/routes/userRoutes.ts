import { Router } from 'express';
import { UserController } from '../controller/userController';
import { validateUuidParam } from '../middleware/validateUuidParam';

export function userRoutes(controller: UserController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.delete('/:id', validateUuidParam('id'), controller.remove);

  return router;
}
