import { UserRepository } from '../repository/UserRepository';
import { User } from '../model/User';
import { UserNotFoundError } from '../error/AppError';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async list(): Promise<User[]> {
    return this.userRepo.findAll();
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepo.deleteById(id);
    if (!deleted) {
      throw new UserNotFoundError();
    }
  }
}
