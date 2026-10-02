import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../core/paginate';
import { LEVELS } from '../schemas/job.schema';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior NodeJS Engineer' })
  @IsNotEmpty({ message: 'Tên job không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ example: ['NODEJS', 'REACTJS'] })
  @ArrayNotEmpty({ message: 'Danh sách skills không được để trống' })
  @IsString({ each: true, message: 'Mỗi skill phải là chuỗi' })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((s: string) => (typeof s === 'string' ? s.trim().toUpperCase() : s))
      : value,
  )
  skills: string[];

  @ApiPropertyOptional({ example: '64e4...' })
  @IsOptional()
  @IsMongoId({ message: 'Company phải là MongoId hợp lệ' })
  company?: string;

  @ApiProperty({ example: 'Hà Nội' })
  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  @IsString()
  location: string;

  @ApiProperty({ example: 25000000 })
  @IsNotEmpty({ message: 'Lương không được để trống' })
  @IsNumber()
  @Min(0, { message: 'Lương phải lớn hơn hoặc bằng 0' })
  salary: number;

  @ApiProperty({ example: 3 })
  @IsNotEmpty({ message: 'Số lượng tuyển dụng không được để trống' })
  @IsNumber()
  @Min(1, { message: 'Số lượng tuyển dụng phải từ 1 trở lên' })
  quantity: number;

  @ApiProperty({ example: 'SENIOR', enum: LEVELS })
  @IsNotEmpty({ message: 'Level không được để trống' })
  @IsIn(LEVELS as unknown as string[], {
    message: `Level phải là một trong: ${LEVELS.join(', ')}`,
  })
  level: string;

  @ApiProperty({ example: '<p>Mô tả công việc...</p>' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-10-01' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày bắt đầu phải là ngày hợp lệ' })
  startDate: Date;

  @ApiProperty({ example: '2026-11-01' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày kết thúc phải là ngày hợp lệ' })
  endDate: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class QueryJobDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'CSV skills ví dụ: reactjs,nodejs',
    example: 'REACTJS,NODEJS',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);
    }
    return value;
  })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
