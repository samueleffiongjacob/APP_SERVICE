import { v4 as uuidv4 } from 'uuid';
import { LeadRequestRepository } from '../repository/LeadRequestRepository';
import { LeadRequest } from '../model/LeadRequest';
import { CreateLeadRequestDto } from '../dto/leadRequestDto';
import { LeadRequestNotFoundError } from '../error/AppError';

export class LeadRequestService {
  constructor(private readonly repo: LeadRequestRepository) {}

  async create(payload: CreateLeadRequestDto): Promise<LeadRequest> {
    const request: LeadRequest = {
      id: uuidv4(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      service: payload.service,
      message: payload.message,
      createdAt: new Date(),
    };

    await this.repo.insert(request);
    return request;
  }

  async list(): Promise<LeadRequest[]> {
    return this.repo.findAll();
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) {
      throw new LeadRequestNotFoundError();
    }
  }
}
