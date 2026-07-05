import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import type { AuthUser } from './types/auth-user.type';
import type { JwtPayload } from './types/jwt-payload.type';
import { UsersService } from '../users/users.service';

/**
 * Prisma's generated UserRole enum and @biomed/shared's UserRole enum share
 * identical string values by design, but TypeScript enums are nominally
 * typed, so they are not directly assignable to one another. This helper
 * documents and centralizes the conversion at the single boundary where a
 * raw Prisma user record becomes an AuthUser.
 */
function toSharedRole(role: { toString(): string }): AuthUser['role'] {
  return role as unknown as AuthUser['role'];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmailForAuth(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: toSharedRole(user.role),
      companyId: user.companyId,
    };

    const tokens = await this.signTokens(authUser);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);

    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: authUser,
      ...tokens,
    };
  }

  async me(userId: string) {
    return this.usersService.findProfileById(userId);
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    if (!refreshSecret) {
      throw new UnauthorizedException('JWT refresh secret is not configured');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdForAuth(payload.sub);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: toSharedRole(user.role),
      companyId: user.companyId,
    };

    const tokens = await this.signTokens(authUser);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);

    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: authUser,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);

    return {
      success: true,
    };
  }

  private async signTokens(user: AuthUser) {
    const accessSecret = this.configService.get<string>('jwt.accessSecret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const accessExpiresInSeconds =
      this.configService.get<number>('jwt.accessExpiresInSeconds') ?? 900;
    const refreshExpiresInSeconds =
      this.configService.get<number>('jwt.refreshExpiresInSeconds') ?? 604800;

    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException('JWT secrets are not configured');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresInSeconds,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresInSeconds,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresInSeconds,
    };
  }
}
