import { z } from 'zod';
import { User } from '../model/User';

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'name must not be empty').max(220),
  email: z.string().trim().email('must be a valid email address'),
  phone: z.string().trim().min(1, 'phone must not be empty').max(15),
  password: z.string().min(8, 'password must be at least 8 characters'),
});
export type SignupRequestDto = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('must be a valid email address'),
  password: z.string().min(1, 'password must not be empty'),
});
export type LoginRequestDto = z.infer<typeof loginSchema>;

/**
 * Safe outward-facing view of `User`- no `passwordHash`. Always map
 * through this before sending a user back to a client.
 */
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export interface LoginResponseDto {
  token: string;
  user: UserResponseDto;
}
