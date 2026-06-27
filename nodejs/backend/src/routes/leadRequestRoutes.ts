import { Router } from 'express';
import { LeadRequestController } from '../controller/leadRequestController';
import { validateBody } from '../middleware/validate';
import { validateUuidParam } from '../middleware/validateUuidParam';
import { createLeadRequestSchema } from '../dto/leadRequestDto';

export function leadRequestRoutes(controller: LeadRequestController): Router {
  const router = Router();

  router.post('/', validateBody(createLeadRequestSchema), controller.create);
  router.get('/', controller.list);
  router.delete('/:id', validateUuidParam('id'), controller.remove);

  return router;
}
