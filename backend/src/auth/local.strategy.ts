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

  // cộng 1 lần sai; lần đầu tạo khoá với hạn 15 phút, gửi chung 1 khối để không có khoá vô hạn
  private async recordFail(key: string) {
    await redis
      ?.multi()
      .set(key, 0, 'EX', LOCK_SECONDS, 'NX')
      .incr(key)
      .exec()
      .catch(() => null);
  }

}
