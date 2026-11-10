import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService.refresh', () => {
  it('token cũ bị dùng lại thì huỷ cả phiên và trả 401', async () => {
    // DB đang lưu bản băm của R2, chủ tài khoản lại gửi R1 cũ
    const usersService = {
      findByIdWithRefreshToken: jest
        .fn()
        .mockResolvedValue({ _id: 'user_1', refreshToken: 'ban-bam-cua-R2' }),
      setRefreshToken: jest.fn().mockResolvedValue(null),
    };
    const jwtService = { verify: jest.fn().mockReturnValue({ sub: 'user_1' }) };
    const configService = { getOrThrow: jest.fn().mockReturnValue('secret') };
    const service = new AuthService(
      usersService as any,
      {} as any,
      jwtService as any,
      configService as any,
    );
    const req = { cookies: { refresh_token: 'R1' } } as any;
    const res = { clearCookie: jest.fn() } as any;

    await expect(service.refresh(req, res)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(usersService.setRefreshToken).toHaveBeenCalledWith('user_1', null);
  });
});
