import { Redis } from 'ioredis';

// Kết nối Redis dùng chung. Không có REDIS_URL (như trên Render) thì redis = null và mọi nơi dùng nó tự bỏ qua.
export const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1 })
    : null;
redis?.on('error', () => { }); // ponytail: bỏ qua lỗi kết nối vì nơi dùng đều tự rơi về đường chính; thêm log nếu cần theo dõi Redis
