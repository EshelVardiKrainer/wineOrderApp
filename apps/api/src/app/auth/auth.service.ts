import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import type {
  IGoogleLoginRequest,
  IAuthResponse,
} from '@wine-order-app/shared-types';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    this.googleClient = new OAuth2Client(clientId);
  }

  async googleLogin(input: IGoogleLoginRequest): Promise<IAuthResponse> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: input.idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!googleId) {
      throw new UnauthorizedException('Google ID not found in token');
    }

    const user = await this.usersService.findOrCreateByGoogle({
      googleId,
      email,
      name: name || email.split('@')[0],
      avatarUrl: picture || null,
    });

    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(jwtPayload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
      },
    };
  }
}
