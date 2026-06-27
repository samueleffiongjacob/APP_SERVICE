import { z } from 'zod';
import { LeadRequest } from '../model/LeadRequest';

export const createLeadRequestSchema = z.object({
  name: z.string().trim().min(1, 'name must not be empty').max(220),
  email: z.string().trim().email('must be a valid email address'),
  phone: z.string().trim().min(1, 'phone must not be empty').max(15),
  service: z.string().trim().min(1, 'service must not be empty').max(520),
  message: z.string().max(2000, 'message is too long'),
});
export type CreateLeadRequestDto = z.infer<typeof createLeadRequestSchema>;

export interface LeadRequestResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: Date;
}

export function toLeadRequestResponseDto(r: LeadRequest): LeadRequestResponseDto {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    service: r.service,
    message: r.message,
    createdAt: r.createdAt,
  };
}
