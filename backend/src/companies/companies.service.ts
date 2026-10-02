import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import {
  CreateCompanyDto,
  QueryCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto';
import { IUser } from '../decorator/customize';
import { escapeRegex, paginate } from '../core/paginate';
import { softDelete } from '../core/soft-delete.plugin';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    try {
      const created = await this.companyModel.create({
        ...createCompanyDto,
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
          `Công ty với tên "${createCompanyDto.name}" đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async findAll(query: QueryCompanyDto) {
    const filter: FilterQuery<CompanyDocument> = {};

    if (query.name) {
      filter.name = { $regex: escapeRegex(query.name), $options: 'i' };
    }
    if (query.address) {
      filter.address = { $regex: escapeRegex(query.address), $options: 'i' };
    }

    return paginate(this.companyModel, filter, query);
  }

  async findOne(id: string) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException(`Không tìm thấy công ty với id: ${id}`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    try {
      const updated = await this.companyModel.findByIdAndUpdate(
        id,
        {
          ...updateCompanyDto,
          updatedBy: {
            _id: user?._id,
            email: user?.email,
          },
        },
        { new: true },
      );

      if (!updated) {
        throw new NotFoundException(`Không tìm thấy công ty với id: ${id}`);
      }

      return updated;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          `Công ty với tên "${updateCompanyDto.name}" đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async remove(id: string, user: IUser) {
    return softDelete(this.companyModel, id, user);
  }
}
