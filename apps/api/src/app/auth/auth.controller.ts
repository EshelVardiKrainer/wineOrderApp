import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody } from '@nestia/core';
import { AuthService } from './auth.service';
import type {
  ILoginRequest,
  IRegisterRequest,
  IAuthResponse,
} from '@wine-order-app/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @TypedRoute.Post('register')
  async register(
    @TypedBody() input: IRegisterRequest,
  ): Promise<IAuthResponse> {
    return this.authService.register(input);
  }

  @TypedRoute.Post('login')
  async login(@TypedBody() input: ILoginRequest): Promise<IAuthResponse> {
    return this.authService.login(input);
  }
}
