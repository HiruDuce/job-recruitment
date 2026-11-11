import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { StorageService, LocalStorageService, CloudinaryStorageService } from './storage.service';

@Module({
  controllers: [FilesController],
  providers: [
    {
      provide: StorageService,
      useFactory: () =>
        process.env.CLOUDINARY_CLOUD_NAME
          ? new CloudinaryStorageService()
          : new LocalStorageService(),
    },
  ],
  exports: [StorageService],
})
export class FilesModule {}
