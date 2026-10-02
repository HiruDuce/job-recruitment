import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../core/paginate';

export class CreateRoleDto {
  @ApiProperty({ example: 'HR' })
  @IsNotEmpty({ message: 'Tên role không được để trống' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  name: string;

  @ApiPropertyOptional({ example: 'Nhà tuyển dụng' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: ['64e4...'] })
  @IsNotEmpty({ message: 'permissions không được để trống' })
  @IsArray()
  @IsMongoId({ each: true, message: 'Mỗi permission phải là MongoId hợp lệ' })
  permissions: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class QueryRoleDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
