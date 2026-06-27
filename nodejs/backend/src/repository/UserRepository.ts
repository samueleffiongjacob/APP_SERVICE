import { Pool } from 'pg';
import { User } from '../model/User';

/** Maps a raw pg row (snake_case columns) onto the camelCase domain model. */
function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export class UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, name, email, phone, password_hash, created_at
       FROM users WHERE email = $1`,
      [email],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT id, name, email, phone, password_hash, created_at
       FROM users ORDER BY created_at DESC`,
    );
    return result.rows.map(rowToUser);
  }

  async insert(user: User): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, user.name, user.email, user.phone, user.passwordHash, user.createdAt],
    );
  }

  async deleteById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      `DELETE FROM users WHERE id = $1
       RETURNING id, name, email, phone, password_hash, created_at`,
      [id],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }
}
