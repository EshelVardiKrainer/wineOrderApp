import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody } from '@nestia/core';
import { AuthService } from './auth.service';
import type {
  IGoogleLoginRequest,
  IAuthResponse,
} from '@wine-order-app/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @TypedRoute.Post('google')
  async googleLogin(
    @TypedBody() input: IGoogleLoginRequest,
  ): Promise<IAuthResponse> {
    return this.authService.googleLogin(input);
  }
}
