jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => ({ on: jest.fn() })),
}));

describe('core/redis', () => {
  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  // Đọc lại redis.ts sau khi đặt biến môi trường, vì kết nối được tạo ngay lúc import.
  // Lấy Redis giả trong cùng lần đọc để xem nó được gọi với tham số gì.
  const load = () => {
    let mod: any;
    let Redis: any;
    jest.isolateModules(() => {
      mod = require('./redis');
      Redis = require('ioredis').Redis;
    });
    return { redis: mod.redis, Redis };
  };

  it('client cache báo lỗi ngay khi mất kết nối, không chờ', () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const { Redis } = load();

    expect(Redis).toHaveBeenCalledWith(
      'redis://localhost:6379',
      expect.objectContaining({ enableOfflineQueue: false, commandTimeout: 500 }),
    );
  });

  it('không có REDIS_URL thì redis = null', () => {
    expect(load().redis).toBeNull();
  });
});
