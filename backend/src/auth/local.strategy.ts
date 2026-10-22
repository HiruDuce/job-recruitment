import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { redis } from '../core/redis';

const MAX_FAILS = 5;
const LOCK_SECONDS = 15 * 60;

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const key = `login-fail:${email.toLowerCase()}`;
    const fails = Number(await redis?.get(key).catch(() => null));
    if (fails >= MAX_FAILS) {
      throw new HttpException(
        'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.password) {
      await this.recordFail(key);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await this.recordFail(key);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    await redis?.del(key).catch(() => null);
    return user;
  }

  // cộng 1 lần sai, lần sai đầu tiên thì đặt hạn 15 phút
  // ponytail: INCR và EXPIRE là 2 lệnh riêng; server sập đúng giữa 2 lệnh thì key không có hạn → dùng MULTI nếu cần chặt chẽ
  private async recordFail(key: string) {
    const count = await redis?.incr(key).catch(() => null);
    if (count === 1) await redis?.expire(key, LOCK_SECONDS).catch(() => null);
  }
}
