import { Request, Response } from 'express';
import { LeadRequestService } from '../service/LeadRequestService';
import { toLeadRequestResponseDto } from '../dto/leadRequestDto';
import { requireStringParam } from '../error/paramHelpers';

export class LeadRequestController {
  constructor(private readonly leadRequestService: LeadRequestService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const request = await this.leadRequestService.create(req.body);
    res.status(201).json(toLeadRequestResponseDto(request));
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const requests = await this.leadRequestService.list();
    res.json(requests.map(toLeadRequestResponseDto));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.leadRequestService.delete(requireStringParam(req, 'id'));
    res.status(204).send();
  };
}
