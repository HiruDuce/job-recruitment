import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ResumesService } from './resumes.service';
import {
  CreateResumeDto,
  QueryResumeDto,
  UpdateResumeStatusDto,
} from './dto/resume.dto';
import {
  SkipPermission,
  ResponseMessage,
  User,
  IUser,
} from '../decorator/customize';

@ApiTags('Resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage('Nộp hồ sơ ứng tuyển thành công')
  create(@Body() createResumeDto: CreateResumeDto, @User() user: IUser) {
    return this.resumesService.create(createResumeDto, user);
  }

  @SkipPermission()
  @Get('me')
  @ResponseMessage('Lấy danh sách hồ sơ của tôi thành công')
  findMine(@User() user: IUser) {
    return this.resumesService.findMine(user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách hồ sơ ứng tuyển thành công')
  findAll(@Query() query: QueryResumeDto, @User() user: IUser) {
    return this.resumesService.findAll(query, user);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật trạng thái hồ sơ thành công')
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateResumeStatusDto: UpdateResumeStatusDto,
    @User() user: IUser,
  ) {
    return this.resumesService.updateStatus(id, updateResumeStatusDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa hồ sơ ứng tuyển thành công')
  remove(@Param('id', ParseObjectIdPipe) id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
