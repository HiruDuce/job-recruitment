import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import {
  CreatePermissionDto,
  QueryPermissionDto,
  UpdatePermissionDto,
} from './dto/permission.dto';
import { IUser } from '../decorator/customize';
import { escapeRegex, paginate } from '../core/paginate';
import { softDelete } from '../core/soft-delete.plugin';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    try {
      const created = await this.permissionModel.create({
        ...createPermissionDto,
        createdBy: {
          _id: user?._id,
          email: user?.email,
        },
      });
      return {
        _id: created._id,
        createdAt: created.createdAt,
      };
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          `Permission với apiPath "${createPermissionDto.apiPath}" và method "${createPermissionDto.method}" đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async findAll(query: QueryPermissionDto) {
    const filter: FilterQuery<PermissionDocument> = {};

    if (query.name) {
      filter.name = { $regex: escapeRegex(query.name), $options: 'i' };
    }
    if (query.apiPath) {
      filter.apiPath = { $regex: escapeRegex(query.apiPath), $options: 'i' };
    }
    if (query.method) {
      filter.method = query.method;
    }
    if (query.module) {
      filter.module = { $regex: escapeRegex(query.module), $options: 'i' };
    }

    return paginate(this.permissionModel, filter, query);
  }

  async findOne(id: string) {
    const permission = await this.permissionModel.findById(id);
    if (!permission) {
      throw new NotFoundException(`Không tìm thấy permission với id: ${id}`);
    }
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    try {
      const updated = await this.permissionModel.findByIdAndUpdate(
        id,
        {
          ...updatePermissionDto,
          updatedBy: {
            _id: user?._id,
            email: user?.email,
          },
        },
        { new: true },
      );
      if (!updated) {
        throw new NotFoundException(`Không tìm thấy permission với id: ${id}`);
      }
      return updated;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          `Permission với apiPath và method này đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async remove(id: string, user: IUser) {
    return softDelete(this.permissionModel, id, user);
  }
}
