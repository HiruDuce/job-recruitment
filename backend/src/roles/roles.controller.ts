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
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  QueryRoleDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { ResponseMessage, User, IUser } from '../decorator/customize';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ResponseMessage('Tạo mới role thành công')
  create(@Body() createRoleDto: CreateRoleDto, @User() user: IUser) {
    return this.rolesService.create(createRoleDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách role thành công')
  findAll(@Query() query: QueryRoleDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin role thành công')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật role thành công')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() user: IUser,
  ) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa role thành công')
  remove(@Param('id', ParseObjectIdPipe) id: string, @User() user: IUser) {
    return this.rolesService.remove(id, user);
  }
}
