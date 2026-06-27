import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repository/UserRepository';
import { User } from '../model/User';
import { SignupRequestDto, LoginRequestDto } from '../dto/authDto';
import { EmailTakenError, InvalidCredentialsError } from '../error/AppError';
import { mapDbError } from '../error/dbError';

const BCRYPT_COST = 12;

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async signup(payload: SignupRequestDto): Promise<User> {
    const existing = await this.userRepo.findByEmail(payload.email);
    if (existing) {
      throw new EmailTakenError();
    }

    const passwordHash = await bcrypt.hash(payload.password, BCRYPT_COST);

    const user: User = {
      id: uuidv4(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      passwordHash,
      createdAt: new Date(),
    };

    try {
      /**
        Can still race with another signup for the same email between
        the check above and this insert; the DB's UNIQUE constraint is
        the real guard, and mapDbError turns that violation into the
        same EmailTakenError (409) a normal duplicate would get.
      */
      await this.userRepo.insert(user);
    } catch (err) {
      throw mapDbError(err);
    }

    return user;
  }

  async login(payload: LoginRequestDto): Promise<User> {
    const user = await this.userRepo.findByEmail(payload.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}
