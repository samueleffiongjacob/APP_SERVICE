import { Pool } from 'pg';
import { LeadRequest } from '../model/LeadRequest';

function rowToLeadRequest(row: any): LeadRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    message: row.message,
    createdAt: row.created_at,
  };
}

export class LeadRequestRepository {
  constructor(private readonly pool: Pool) {}

  async insert(request: LeadRequest): Promise<void> {
    await this.pool.query(
      `INSERT INTO lead_requests (id, name, email, phone, service, message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        request.id,
        request.name,
        request.email,
        request.phone,
        request.service,
        request.message,
        request.createdAt,
      ],
    );
  }

  async findAll(): Promise<LeadRequest[]> {
    const result = await this.pool.query(
      `SELECT id, name, email, phone, service, message, created_at
       FROM lead_requests ORDER BY created_at DESC`,
    );
    return result.rows.map(rowToLeadRequest);
  }

  async deleteById(id: string): Promise<LeadRequest | null> {
    const result = await this.pool.query(
      `DELETE FROM lead_requests WHERE id = $1
       RETURNING id, name, email, phone, service, message, created_at`,
      [id],
    );
    return result.rows[0] ? rowToLeadRequest(result.rows[0]) : null;
  }
}
