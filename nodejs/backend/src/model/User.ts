/**
 * Domain entity, mirrors the `users` table exactly. Note this includes
 * `passwordHash` never return this type directly from a controller.
 * Map to `UserResponseDto` first (see dto/authDto.ts).
 */
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
}
