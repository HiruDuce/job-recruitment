import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RolesService } from '../roles/roles.service';
import { IUser } from '../decorator/customize';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any): Promise<IUser> {
    // ponytail: 1 query role/request, cache theo roleId nếu tải cao
    let permissions: { method: string; apiPath: string }[] = [];

    if (payload.role?._id) {
      const role = await this.rolesService.findOneWithPermissions(payload.role._id);
      if (role && role.permissions) {
        permissions = (role.permissions as any[]).map((p) => ({
          method: p.method,
          apiPath: p.apiPath,
        }));
      }
    }

    return {
      _id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: {
        _id: payload.role?._id,
        name: payload.role?.name,
      },
      company: payload.company,
      permissions,
    };
  }
}
