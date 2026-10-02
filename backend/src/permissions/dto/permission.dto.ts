import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../core/paginate';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Lấy danh sách người dùng' })
  @IsNotEmpty({ message: 'Tên permission không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ example: '/api/v1/users' })
  @IsNotEmpty({ message: 'apiPath không được để trống' })
  @Matches(/^\/api\/v1\//, { message: 'apiPath phải bắt đầu bằng /api/v1/' })
  apiPath: string;

  @ApiProperty({ example: 'GET', enum: ['GET', 'POST', 'PATCH', 'DELETE'] })
  @IsNotEmpty({ message: 'method không được để trống' })
  @IsIn(['GET', 'POST', 'PATCH', 'DELETE'], {
    message: 'method phải là GET, POST, PATCH hoặc DELETE',
  })
  method: string;

  @ApiProperty({ example: 'USERS' })
  @IsNotEmpty({ message: 'module không được để trống' })
  @IsString()
  module: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class QueryPermissionDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiPath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  module?: string;
}
