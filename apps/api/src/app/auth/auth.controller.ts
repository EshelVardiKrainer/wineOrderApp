import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  IGoogleLoginRequest,
  IAuthResponse,
} from '@wine-order-app/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(
    @Body() input: IGoogleLoginRequest,
  ): Promise<IAuthResponse> {
    return this.authService.googleLogin(input);
  }
}
