import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { USER_ROLE } from '../roles/schemas/role.schema';
import { IUser } from '../decorator/customize';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(user: any, res: Response) {
    const accessExpire = Number(
      this.configService.getOrThrow<number>('JWT_ACCESS_EXPIRE'),
    );
    const refreshExpire = Number(
      this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRE'),
    );

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: {
        _id: user.role?._id ? user.role._id.toString() : user.role?.toString(),
        name: user.role?.name,
      },
      company: user.company?._id
        ? user.company._id.toString()
        : user.company?.toString(),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpire,
    });

    const refreshPayload = {
      ...payload,
      jti: crypto.randomUUID(),
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpire,
    });

    const hashedRefreshToken = this.hashToken(refreshToken);
    await this.usersService.setRefreshToken(payload.sub, hashedRefreshToken);

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      path: '/api/v1/auth',
      maxAge: refreshExpire * 1000,
    });

    let permissions: { method: string; apiPath: string }[] = [];
    if (payload.role._id) {
      const fullRole = await this.rolesService.findOneWithPermissions(
        payload.role._id,
      );
      if (fullRole && fullRole.permissions) {
        permissions = (fullRole.permissions as any[]).map((p) => ({
          method: p.method,
          apiPath: p.apiPath,
        }));
      }
    }

    return {
      access_token: accessToken,
      user: {
        _id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        company: payload.company,
        permissions,
      },
    };
  }

  async login(user: any, res: Response) {
    return this.issueTokens(user, res);
  }

  async register(registerDto: RegisterDto) {
    const defaultRole = await this.rolesService.findByName(USER_ROLE);
    if (!defaultRole) {
      throw new BadRequestException(`Role mặc định ${USER_ROLE} chưa được tạo`);
    }

    return this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      role: defaultRole._id.toString(),
    });
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token trong cookie');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
    if (!user || !user.refreshToken) {
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      throw new UnauthorizedException('Phiên đăng nhập không tồn tại');
    }

    const hashedIncoming = this.hashToken(refreshToken);
    if (hashedIncoming !== user.refreshToken) {
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      throw new UnauthorizedException('Refresh token không khớp hoặc đã bị sử dụng');
    }

    return this.issueTokens(user, res);
  }

  async logout(user: IUser, res: Response) {
    await this.usersService.setRefreshToken(user._id, null);
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { success: true };
  }
}
