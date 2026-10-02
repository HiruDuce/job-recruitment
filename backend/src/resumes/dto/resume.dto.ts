import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../core/paginate';
import { RESUME_STATUS } from '../schemas/resume.schema';

export class CreateResumeDto {
  @ApiProperty({ example: '/images/resume/12345678-1234-1234-1234-123456789abc.pdf' })
  @IsNotEmpty({ message: 'url CV không được để trống' })
  @Matches(/^\/images\/resume\/.+\.pdf$/, {
    message: 'url phải có định dạng /images/resume/*.pdf',
  })
  url: string;

  @ApiProperty({ example: '64e4...' })
  @IsNotEmpty({ message: 'job không được để trống' })
  @IsMongoId({ message: 'job phải là MongoId hợp lệ' })
  job: string;
}

export class UpdateResumeStatusDto {
  @ApiProperty({ example: 'REVIEWING', enum: RESUME_STATUS })
  @IsNotEmpty({ message: 'status không được để trống' })
  @IsIn(RESUME_STATUS as unknown as string[], {
    message: `status phải là một trong: ${RESUME_STATUS.join(', ')}`,
  })
  status: string;
}

export class QueryResumeDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RESUME_STATUS })
  @IsOptional()
  @IsIn(RESUME_STATUS as unknown as string[])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  job?: string;
}
