import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  ADMIN_ROLE,
  Role,
  RoleDocument,
} from './schemas/role.schema';
import {
  CreateRoleDto,
  QueryRoleDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { IUser } from '../decorator/customize';
import { escapeRegex, paginate } from '../core/paginate';
import { softDelete } from '../core/soft-delete.plugin';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    try {
      const created = await this.roleModel.create({
        ...createRoleDto,
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
          `Role với tên "${createRoleDto.name}" đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async findAll(query: QueryRoleDto) {
    const filter: FilterQuery<RoleDocument> = {};

    if (query.name) {
      filter.name = { $regex: escapeRegex(query.name), $options: 'i' };
    }

    return paginate(this.roleModel, filter, query, {
      path: 'permissions',
      select: '_id name apiPath method module',
    });
  }

  async findOne(id: string) {
    const role = await this.roleModel.findById(id).populate({
      path: 'permissions',
      select: '_id name apiPath method module',
    });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với id: ${id}`);
    }
    return role;
  }

  async findByName(name: string) {
    return this.roleModel.findOne({ name, isActive: true });
  }

  async findOneWithPermissions(id: string) {
    return this.roleModel
      .findOne({ _id: id, isActive: true })
      .populate({
        path: 'permissions',
        select: 'name apiPath method module',
      })
      .exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    const currentRole = await this.roleModel.findById(id);
    if (!currentRole) {
      throw new NotFoundException(`Không tìm thấy role với id: ${id}`);
    }

    if (currentRole.name === ADMIN_ROLE && updateRoleDto.name && updateRoleDto.name !== ADMIN_ROLE) {
      throw new BadRequestException('Không được phép đổi tên role ADMIN');
    }

    if (currentRole.name === ADMIN_ROLE && updateRoleDto.isActive === false) {
      throw new BadRequestException('Không được phép vô hiệu hóa role ADMIN');
    }

    try {
      const updated = await this.roleModel.findByIdAndUpdate(
        id,
        {
          ...updateRoleDto,
          updatedBy: {
            _id: user?._id,
            email: user?.email,
          },
        },
        { new: true },
      );
      return updated;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          `Role với tên "${updateRoleDto.name}" đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async remove(id: string, user: IUser) {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với id: ${id}`);
    }

    if (role.name === ADMIN_ROLE) {
      throw new BadRequestException('Không được phép xóa role ADMIN');
    }

    return softDelete(this.roleModel, id, user);
  }
}
