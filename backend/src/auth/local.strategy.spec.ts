import { HttpException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Redis giả: multi() trả về một "khối lệnh" có set, incr, exec nối chuỗi được
const mockMulti = {
  set: jest.fn().mockReturnThis(),
  incr: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};
const mockRedis = {
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
  multi: jest.fn(() => mockMulti),
};
jest.mock('../core/redis', () => ({ redis: mockRedis }));

import { LocalStrategy } from './local.strategy';

describe('LocalStrategy.validate', () => {
  const user = { _id: 'user_1', password: bcrypt.hashSync('dung-mat-khau', 4) };
  const setup = () => {
    const usersService = { findByEmailWithPassword: jest.fn().mockResolvedValue(user) };
    return { strategy: new LocalStrategy(usersService as any), usersService };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
  });

  it('sai mật khẩu: đếm lần sai và đặt hạn 15 phút trong cùng một khối MULTI', async () => {
    const { strategy } = setup();

    await expect(strategy.validate('User@ITJobs.local', 'sai')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockRedis.multi).toHaveBeenCalledTimes(1);
    expect(mockMulti.set).toHaveBeenCalledWith(
      'login-fail:user@itjobs.local',
      0,
      'EX',
      900,
      'NX',
    );
    expect(mockMulti.incr).toHaveBeenCalledWith('login-fail:user@itjobs.local');
    expect(mockMulti.exec).toHaveBeenCalled();
  });

  it('đã sai 5 lần: trả 429, không kiểm tra mật khẩu', async () => {
    mockRedis.get.mockResolvedValue('5');
    const { strategy, usersService } = setup();

    const error = await strategy.validate('user@itjobs.local', 'dung-mat-khau').catch((e) => e);
    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(429);
    expect(usersService.findByEmailWithPassword).not.toHaveBeenCalled();
  });

  it('đúng mật khẩu: xoá bộ đếm', async () => {
    const { strategy } = setup();

    await expect(strategy.validate('user@itjobs.local', 'dung-mat-khau')).resolves.toBe(user);
    expect(mockRedis.del).toHaveBeenCalledWith('login-fail:user@itjobs.local');
    expect(mockRedis.multi).not.toHaveBeenCalled();
  });
});
