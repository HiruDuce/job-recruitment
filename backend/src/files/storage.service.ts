import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export abstract class StorageService {
  abstract save(file: Express.Multer.File, folder: string): Promise<string>;
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

@Injectable()
export class LocalStorageService extends StorageService {
  async save(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = MIME_EXTENSION_MAP[file.mimetype];
    if (!ext) {
      throw new BadRequestException(`Không hỗ trợ định dạng file: ${file.mimetype}`);
    }

    const fileName = `${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images', folder);

    await fs.promises.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);

    return `/images/${folder}/${fileName}`;
  }
}

@Injectable()
export class CloudinaryStorageService extends StorageService {
  async save(file: Express.Multer.File, folder: string): Promise<string> {
    if (!MIME_EXTENSION_MAP[file.mimetype]) {
      throw new BadRequestException(`Không hỗ trợ định dạng file: ${file.mimetype}`);
    }

    const publicId = `${folder}/${crypto.randomUUID()}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');

    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }));
    form.append('api_key', process.env.CLOUDINARY_API_KEY!);
    form.append('timestamp', String(timestamp));
    form.append('public_id', publicId);
    form.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form, signal: AbortSignal.timeout(20000) },
    );
    if (!res.ok) {
      throw new InternalServerErrorException('Không tải được file lên, vui lòng thử lại');
    }

    const data = await res.json();
    return data.secure_url;
  }
}

