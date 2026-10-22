import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto, QueryJobDto, UpdateJobDto } from './dto/job.dto';
import { IUser } from '../decorator/customize';
import { escapeRegex, paginate } from '../core/paginate';
import { softDelete } from '../core/soft-delete.plugin';
import { HR_ROLE } from '../roles/schemas/role.schema';
import { redis } from '../core/redis';

// ponytail: cache theo TTL 60s, không xoá khi sửa job → job mới hiện chậm tối đa 60s; xoá key trong create/update/remove nếu cần tức thì

const CACHE_TTL = 60;

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
  ) { }

  private scope(user: IUser): Record<string, any> {
    if (user?.role?.name === HR_ROLE) {
      return { company: user.company };
    }
    return {};
  }

  private buildFilter(query: QueryJobDto): FilterQuery<JobDocument> {
    const filter: FilterQuery<JobDocument> = {};

    if (query.name) {
      filter.name = { $regex: escapeRegex(query.name), $options: 'i' };
    }
    if (query.skills && query.skills.length > 0) {
      filter.skills = { $in: query.skills };
    }
    if (query.location) {
      filter.location = { $regex: escapeRegex(query.location), $options: 'i' };
    }
    if (query.level) {
      filter.level = query.level;
    }
    if (query.company) {
      filter.company = query.company;
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    return filter;
  }

  async findPublic(query: QueryJobDto) {
    const key = `jobs:public:${JSON.stringify(query)}`;
    const cached = await redis?.get(key).catch(() => null);
    if (cached) return JSON.parse(cached);

    const filter = this.buildFilter(query);
    filter.isActive = true;
    filter.endDate = { $gte: new Date() };

    const result = await paginate(this.jobModel, filter, query, {
      path: 'company',
      select: '_id name logo',
    });
    await redis?.set(key, JSON.stringify(result), 'EX', CACHE_TTL).catch(() => null);
    return result;
  }

  async findManage(query: QueryJobDto, user: IUser) {
    const filter = this.buildFilter(query);
    const userScope = this.scope(user);
    Object.assign(filter, userScope);

    return paginate(this.jobModel, filter, query, {
      path: 'company',
      select: '_id name logo',
    });
  }

  async findOne(id: string) {
    const job = await this.jobModel.findById(id).populate({
      path: 'company',
      select: '_id name logo address description',
    });

    if (!job) {
      throw new NotFoundException(`Không tìm thấy việc làm với id: ${id}`);
    }
    return job;
  }

  async create(createJobDto: CreateJobDto, user: IUser) {
    let companyId = createJobDto.company;

    if (user?.role?.name === HR_ROLE) {
      if (!user.company) {
        throw new BadRequestException('Tài khoản HR chưa được gán cho công ty nào');
      }
      companyId = user.company;
    } else {
      if (!companyId) {
        throw new BadRequestException('Bắt buộc phải chọn company cho job');
      }
    }

    const startDate = new Date(createJobDto.startDate);
    const endDate = new Date(createJobDto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }

    const created = await this.jobModel.create({
      ...createJobDto,
      company: companyId,
      startDate,
      endDate,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    return {
      _id: created._id,
      createdAt: created.createdAt,
    };
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const userScope = this.scope(user);
    const existing = await this.jobModel.findOne({ _id: id, ...userScope });
    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy việc làm hoặc bạn không có quyền sửa job này`,
      );
    }

    if (user?.role?.name === HR_ROLE && updateJobDto.company) {
      delete (updateJobDto as any).company;
    }

    const startDate = updateJobDto.startDate
      ? new Date(updateJobDto.startDate)
      : existing.startDate;
    const endDate = updateJobDto.endDate
      ? new Date(updateJobDto.endDate)
      : existing.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }

    const updated = await this.jobModel.findOneAndUpdate(
      { _id: id, ...userScope },
      {
        ...updateJobDto,
        startDate,
        endDate,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
      { new: true },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    const userScope = this.scope(user);
    const existing = await this.jobModel.findOne({ _id: id, ...userScope });
    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy việc làm hoặc bạn không có quyền xóa job này`,
      );
    }

    return softDelete(this.jobModel, id, user);
  }
}
