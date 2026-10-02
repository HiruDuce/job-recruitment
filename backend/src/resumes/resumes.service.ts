import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import {
  CreateResumeDto,
  QueryResumeDto,
  UpdateResumeStatusDto,
} from './dto/resume.dto';
import { IUser } from '../decorator/customize';
import { paginate } from '../core/paginate';
import { softDelete } from '../core/soft-delete.plugin';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { HR_ROLE } from '../roles/schemas/role.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: Model<ResumeDocument>,
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
    private mailService: MailService,
  ) {}

  private scope(user: IUser): Record<string, any> {
    if (user?.role?.name === HR_ROLE) {
      return { company: user.company };
    }
    return {};
  }

  async create(createResumeDto: CreateResumeDto, user: IUser) {
    const job = await this.jobModel.findOne({
      _id: createResumeDto.job,
      isActive: true,
      endDate: { $gte: new Date() },
    });

    if (!job) {
      throw new BadRequestException(
        'Công việc này không tồn tại, đã hết hạn hoặc tạm dừng tuyển dụng',
      );
    }

    const existingResume = await this.resumeModel.findOne({
      user: user._id,
      job: createResumeDto.job,
    });

    if (existingResume) {
      throw new BadRequestException(
        'Bạn đã nộp CV cho công việc này rồi, không thể nộp lại',
      );
    }

    const companyId = (job.company as any)?._id || job.company;

    const initialHistory = [
      {
        status: 'PENDING',
        updatedAt: new Date(),
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    ];

    const created = await this.resumeModel.create({
      email: user.email,
      user: user._id,
      url: createResumeDto.url,
      status: 'PENDING',
      company: companyId,
      job: job._id,
      history: initialHistory,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: created._id,
      createdAt: created.createdAt,
    };
  }

  async findMine(user: IUser) {
    return this.resumeModel
      .find({ user: user._id })
      .sort('-createdAt')
      .populate({ path: 'job', select: 'name' })
      .populate({ path: 'company', select: 'name logo' })
      .exec();
  }

  async findAll(query: QueryResumeDto, user: IUser) {
    const filter: FilterQuery<ResumeDocument> = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.job) {
      filter.job = query.job;
    }

    const userScope = this.scope(user);
    Object.assign(filter, userScope);

    return paginate(this.resumeModel, filter, query, [
      { path: 'user', select: 'name email' },
      { path: 'job', select: 'name' },
      { path: 'company', select: 'name' },
    ]);
  }

  async updateStatus(
    id: string,
    updateResumeStatusDto: UpdateResumeStatusDto,
    user: IUser,
  ) {
    const userScope = this.scope(user);

    const historyItem = {
      status: updateResumeStatusDto.status,
      updatedAt: new Date(),
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
    };

    const updated = await this.resumeModel
      .findOneAndUpdate(
        { _id: id, ...userScope },
        {
          status: updateResumeStatusDto.status,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
          $push: { history: historyItem },
        },
        { new: true },
      )
      .populate({ path: 'job', select: 'name' })
      .populate({ path: 'company', select: 'name' })
      .populate({ path: 'user', select: 'name' });

    if (!updated) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ hoặc bạn không có quyền cập nhật hồ sơ này',
      );
    }

    // Gửi email thông báo trạng thái mới (bất đồng bộ, không chặn response)
    const candidateName =
      (updated.user as any)?.name || updated.email || 'Ứng viên';
    const jobName = (updated.job as any)?.name || 'Vị trí IT';
    const companyName = (updated.company as any)?.name || 'Công ty tuyển dụng';

    this.mailService.send(
      updated.email,
      `[ITJobs] Cập nhật trạng thái hồ sơ ứng tuyển: ${jobName}`,
      'resume-status',
      {
        candidateName,
        jobName,
        companyName,
        status: updated.status,
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    const userScope = this.scope(user);
    const existing = await this.resumeModel.findOne({ _id: id, ...userScope });
    if (!existing) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ hoặc bạn không có quyền xóa hồ sơ này',
      );
    }

    return softDelete(this.resumeModel, id, user);
  }
}
