import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, SKIP_PERMISSION_KEY, IUser } from '../decorator/customize';

export function hasPermission(
  user: IUser | null | undefined,
  method: string,
  path: string,
): boolean {
  if (!user || !user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  const normalizedMethod = method.toUpperCase();
  return user.permissions.some(
    (p) =>
      p.method.toUpperCase() === normalizedMethod &&
      p.apiPath === path,
  );
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ hoặc không có quyền truy cập');
    }

    const skipPermission = this.reflector.getAllAndOverride<boolean>(
      SKIP_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipPermission) {
      return user;
    }

    const request = context.switchToHttp().getRequest();
    const targetPath = request.route?.path;
    const method = request.method;

    const permitted = hasPermission(user, method, targetPath);
    if (!permitted) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện hành động ${method} trên ${targetPath}`,
      );
    }

    return user;
  }
}
