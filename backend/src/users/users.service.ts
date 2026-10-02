import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from './dto/user.dto';
import { IUser } from '../decorator/customize';
import { escapeRegex, paginate } from '../core/paginate';
import { softDelete } from '../core/soft-delete.plugin';
import { RolesService } from '../roles/roles.service';
import { ADMIN_ROLE, HR_ROLE } from '../roles/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private rolesService: RolesService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async create(createUserDto: CreateUserDto, user?: IUser) {
    const role = await this.rolesService.findOne(createUserDto.role);
    if (!role) {
      throw new BadRequestException('Role không tồn tại');
    }

    if (role.name === HR_ROLE && !createUserDto.company) {
      throw new BadRequestException('Người dùng với role HR bắt buộc phải gắn với Company');
    }

    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      const created = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
        createdBy: user
          ? {
              _id: user._id,
              email: user.email,
            }
          : undefined,
      });

      return {
        _id: created._id,
        createdAt: created.createdAt,
      };
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          `Email "${createUserDto.email}" đã tồn tại trên hệ thống`,
        );
      }
      throw error;
    }
  }

  async findAll(query: QueryUserDto) {
    const filter: FilterQuery<UserDocument> = {};

    if (query.name) {
      filter.name = { $regex: escapeRegex(query.name), $options: 'i' };
    }
    if (query.email) {
      filter.email = { $regex: escapeRegex(query.email), $options: 'i' };
    }

    return paginate(this.userModel, filter, query, [
      { path: 'role', select: '_id name' },
      { path: 'company', select: '_id name' },
    ]);
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate({ path: 'role', select: '_id name' })
      .populate({ path: 'company', select: '_id name' });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    }
    return user;
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate({ path: 'role', select: '_id name' });
  }

  async findByIdWithRefreshToken(id: string) {
    return this.userModel
      .findById(id)
      .select('+refreshToken')
      .populate({ path: 'role', select: '_id name' });
  }

  async setRefreshToken(id: string, refreshToken: string | null) {
    return this.userModel.findByIdAndUpdate(
      id,
      { refreshToken },
      { new: true },
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (updateUserDto.role) {
      const role = await this.rolesService.findOne(updateUserDto.role);
      if (!role) {
        throw new BadRequestException('Role không tồn tại');
      }

      if (role.name === HR_ROLE && !updateUserDto.company) {
        const currentUser = await this.userModel.findById(id);
        if (!currentUser?.company) {
          throw new BadRequestException('Người dùng với role HR bắt buộc phải có Company');
        }
      }
    }

    try {
      const updated = await this.userModel.findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          updatedBy: {
            _id: user?._id,
            email: user?.email,
          },
        },
        { new: true },
      );

      if (!updated) {
        throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
      }

      return updated;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          `Email "${updateUserDto.email}" đã tồn tại trên hệ thống`,
        );
      }
      throw error;
    }
  }

  async remove(id: string, user: IUser) {
    const targetUser = await this.userModel.findById(id).populate({
      path: 'role',
      select: 'name',
    });

    if (!targetUser) {
      throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    }

    const roleName = (targetUser.role as any)?.name;
    if (roleName === ADMIN_ROLE) {
      throw new BadRequestException('Không được phép xóa user có role ADMIN');
    }

    return softDelete(this.userModel, id, user);
  }
}
