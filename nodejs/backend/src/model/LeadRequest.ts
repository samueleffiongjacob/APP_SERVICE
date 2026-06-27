export interface LeadRequest {
  id: string; // UUID
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: Date;
}
