import { Redis } from 'ioredis';

// Kết nối Redis cho cache và khoá đăng nhập: mất kết nối thì báo lỗi ngay để rơi về MongoDB, không chờ.

export const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        commandTimeout: 500,
    })
    : null;

redis?.on('error', () => { }); // ponytail: bỏ qua lỗi kết nối vì nơi dùng đều tự rơi về đường chính; thêm log nếu cần theo dõi Redis
