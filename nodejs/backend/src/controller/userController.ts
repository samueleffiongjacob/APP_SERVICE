import { Request, Response } from 'express';
import { UserService } from '../service/UserService';
import { toUserResponseDto } from '../dto/authDto';
import { requireStringParam } from '../error/paramHelpers';

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.list();
    res.json(users.map(toUserResponseDto));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.userService.delete(requireStringParam(req, 'id'));
    res.status(204).send();
  };
}
