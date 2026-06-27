import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../service/AuthService';
import { toUserResponseDto, LoginResponseDto } from '../dto/authDto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  signup = async (req: Request, res: Response): Promise<void> => {
    // req.body was already parsed + validated by validateBody(signupSchema)
    const user = await this.authService.signup(req.body);
    res.status(201).json(toUserResponseDto(user));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.login(req.body);
    /*
      NOTE: this issues a random UUID as a "token" with no signing, expiry, or session storage. 
      It is not a real bearer token yet. Wire up real auth (JWT or a session table)
      before protecting any route with it.
    */
    const response: LoginResponseDto = {
      token: uuidv4(),
      user: toUserResponseDto(user),
    };

    res.json(response);
  };
}
