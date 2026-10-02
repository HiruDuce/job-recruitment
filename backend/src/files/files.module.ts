import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { StorageService, LocalStorageService } from './storage.service';

@Module({
  controllers: [FilesController],
  providers: [
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
  ],
  exports: [StorageService],
})
export class FilesModule {}
