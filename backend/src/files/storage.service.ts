import { Injectable, BadRequestException } from '@nestjs/common';
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
