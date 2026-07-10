import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { AuthUser } from '../../auth/types/auth-user.type';
import type { JwtPayload } from '../../auth/types/jwt-payload.type';
import type { RequestWithUser } from '../../auth/types/request-with-user.type';
import { PrismaService } from '../../database/prisma.service';

/**
 * Prisma's generated UserRole enum and @vitatech/shared's UserRole enum share
 * identical string values by design, but TypeScript enums are nominally
 * typed, so they are not directly assignable to one another. This helper
 * documents and centralizes the conversion at the boundary where a raw
 * Prisma user record becomes an AuthUser.
 */
function toSharedRole(role: { toString(): string }): AuthUser['role'] {
  return role as unknown as AuthUser['role'];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secret = this.configService.get<string>('jwt.accessSecret');

    if (!secret) {
      throw new UnauthorizedException('JWT access secret is not configured');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      const currentUser = await this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
        },
      });

      if (!currentUser) {
        throw new UnauthorizedException('Invalid or inactive user');
      }

      const memberships = await this.prisma.companyMembership.findMany({
        where: { userId: currentUser.id, status: 'ACTIVE' },
        select: { companyId: true },
      });

      const user: AuthUser = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: toSharedRole(currentUser.role),
        companyId: currentUser.companyId,
        companyIds: [
          ...new Set(
            memberships.map(
              (membership: { companyId: string }) => membership.companyId,
            ),
          ),
        ],
      };

      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: RequestWithUser): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
