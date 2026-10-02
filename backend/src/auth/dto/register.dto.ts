import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn Ứng Viên' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'candidate@itjobs.local' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@itjobs.local' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin@123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
