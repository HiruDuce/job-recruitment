import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../core/paginate';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Google Vietnam' })
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Hà Nội, Việt Nam' })
  @IsNotEmpty({ message: 'Địa chỉ công ty không được để trống' })
  @IsString()
  address: string;

  @ApiProperty({ example: '<p>Mô tả công ty...</p>' })
  @IsNotEmpty({ message: 'Mô tả công ty không được để trống' })
  @IsString()
  description: string;

  @ApiProperty({ example: '/images/company/abc.png' })
  @IsNotEmpty({ message: 'Logo không được để trống' })
  @Matches(
    /^(\/images\/company\/|https:\/\/res\.cloudinary\.com\/rusdecqy\/image\/upload\/v\d+\/company\/)[\w-]+\.\w+$/,
    { message: 'Logo không hợp lệ' },
  )

  logo: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class QueryCompanyDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
