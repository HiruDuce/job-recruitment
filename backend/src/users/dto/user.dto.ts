import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../core/paginate';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@itjobs.local' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: '64e4...' })
  @IsNotEmpty({ message: 'Role không được để trống' })
  @IsMongoId({ message: 'Role phải là MongoId hợp lệ' })
  role: string;

  @ApiPropertyOptional({ example: '64e4...' })
  @IsOptional()
  @IsMongoId({ message: 'Company phải là MongoId hợp lệ' })
  company?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
