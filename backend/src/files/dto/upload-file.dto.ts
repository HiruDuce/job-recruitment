import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ example: 'company', enum: ['company', 'resume'] })
  @IsNotEmpty({ message: 'folder không được để trống' })
  @IsIn(['company', 'resume'], {
    message: 'folder chỉ được phép là "company" hoặc "resume"',
  })
  folder: 'company' | 'resume';
}
