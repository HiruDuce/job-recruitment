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
import { JobsService } from './jobs.service';
import { CreateJobDto, QueryJobDto, UpdateJobDto } from './dto/job.dto';
import {
  Public,
  ResponseMessage,
  User,
  IUser,
} from '../decorator/customize';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách việc làm công khai thành công')
  findPublic(@Query() query: QueryJobDto) {
    return this.jobsService.findPublic(query);
  }

  @Get('manage')
  @ResponseMessage('Lấy danh sách việc làm quản lý thành công')
  findManage(@Query() query: QueryJobDto, @User() user: IUser) {
    return this.jobsService.findManage(query, user);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Lấy thông tin việc làm thành công')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @ResponseMessage('Tạo mới việc làm thành công')
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật việc làm thành công')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser,
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa việc làm thành công')
  remove(@Param('id', ParseObjectIdPipe) id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
