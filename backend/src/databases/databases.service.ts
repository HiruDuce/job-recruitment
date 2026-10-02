import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  Permission,
  PermissionDocument,
} from '../permissions/schemas/permission.schema';
import {
  ADMIN_ROLE,
  HR_ROLE,
  Role,
  RoleDocument,
  USER_ROLE,
} from '../roles/schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Resume, ResumeDocument } from '../resumes/schemas/resume.schema';
import { INIT_COMPANIES, INIT_JOBS_DATA, INIT_PERMISSIONS } from './seed-data';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
    @InjectModel(Resume.name)
    private resumeModel: Model<ResumeDocument>,
  ) {}

  async onModuleInit() {
    const shouldInit = this.configService.get<string>('SHOULD_INIT');
    if (shouldInit !== 'true') {
      return;
    }

    const countPermissions = await this.permissionModel.countDocuments();
    if (countPermissions > 0) {
      this.logger.log('Database already initialized. Checking mock jobs...');
      await this.seedMockJobsIfEmpty();
      return;
    }

    this.logger.log('>>> Starting Database Seeding...');

    // 1. Seed Permissions
    const createdPermissions = await this.permissionModel.insertMany(
      INIT_PERMISSIONS.map((p) => ({
        name: p.name,
        apiPath: p.apiPath,
        method: p.method,
        module: p.module,
      })),
    );
    this.logger.log(`Created ${createdPermissions.length} permissions.`);

    // Map permissions by (method:apiPath)
    const permissionMap = new Map<string, any>();
    createdPermissions.forEach((p) => {
      permissionMap.set(`${p.method}:${p.apiPath}`, p._id);
    });

    // 2. Filter permissions for HR & NORMAL_USER
    const hrPermissionIds = INIT_PERMISSIONS.filter((p) => p.seedRole === 'HR').map(
      (p) => permissionMap.get(`${p.method}:${p.apiPath}`),
    );

    const userPermissionIds = INIT_PERMISSIONS.filter(
      (p) => p.seedRole === 'NORMAL_USER',
    ).map((p) => permissionMap.get(`${p.method}:${p.apiPath}`));

    const allPermissionIds = createdPermissions.map((p) => p._id);

    // 3. Create Roles
    const adminRole = await this.roleModel.create({
      name: ADMIN_ROLE,
      description: 'Quản trị viên toàn hệ thống',
      isActive: true,
      permissions: allPermissionIds,
    });

    const hrRole = await this.roleModel.create({
      name: HR_ROLE,
      description: 'Nhà tuyển dụng công ty',
      isActive: true,
      permissions: hrPermissionIds,
    });

    const userRole = await this.roleModel.create({
      name: USER_ROLE,
      description: 'Ứng viên tìm việc',
      isActive: true,
      permissions: userPermissionIds,
    });

    this.logger.log('Created Roles: ADMIN, HR, NORMAL_USER.');

    // 4. Create Companies
    const demoCompany = await this.companyModel.create({
      name: 'Google Vietnam Tech Corp',
      address: 'Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
      description: '<p>Công ty công nghệ hàng đầu thế giới về trí tuệ nhân tạo và tìm kiếm.</p>',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    });
    this.logger.log(`Created Demo Company: ${demoCompany.name}`);

    const companyMap = new Map<string, any>();
    companyMap.set('GOOGLE', demoCompany._id);

    for (const c of INIT_COMPANIES) {
      const comp = await this.companyModel.create({
        name: c.name,
        address: c.address,
        description: c.description,
        logo: c.logo,
      });
      companyMap.set(c.code, comp._id);
    }
    this.logger.log(`Created ${INIT_COMPANIES.length} additional companies.`);

    // 5. Create Users
    const adminEmail =
      this.configService.getOrThrow<string>('ADMIN_EMAIL');
    const adminPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const createdUsers = await this.userModel.create([
      {
        name: 'Super Admin',
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: adminRole._id,
      },
      {
        name: 'HR Recruiter Demo',
        email: 'hr@itjobs.local',
        password: hashedPassword,
        role: hrRole._id,
        company: demoCompany._id,
      },
      {
        name: 'IT Candidate Demo',
        email: 'user@itjobs.local',
        password: hashedPassword,
        role: userRole._id,
      },
    ]);

    this.logger.log('Created Initial Users: admin, hr@itjobs.local, user@itjobs.local.');

    // 6. Seed 20 Mock Jobs
    const jobsToInsert = INIT_JOBS_DATA.map((j) => {
      const compId = companyMap.get(j.companyCode) || demoCompany._id;
      const now = new Date();
      const startDate = new Date(now.getTime() - Math.floor(Math.random() * 5) * 86400000);
      const endDate = new Date(now.getTime() + (20 + Math.floor(Math.random() * 30)) * 86400000);

      return {
        name: j.name,
        skills: j.skills,
        company: compId,
        location: j.location,
        salary: j.salary,
        quantity: j.quantity,
        level: j.level,
        description: j.description,
        startDate,
        endDate,
        isActive: true,
      };
    });

    const insertedJobs = await this.jobModel.insertMany(jobsToInsert);
    this.logger.log(`Created ${insertedJobs.length} mock jobs.`);

    // 7. Seed Sample Resumes
    const demoCandidate = createdUsers[2];
    if (insertedJobs.length >= 2 && demoCandidate) {
      await this.resumeModel.create([
        {
          email: demoCandidate.email,
          user: demoCandidate._id,
          url: '/images/resume/demo-cv.pdf',
          status: 'REVIEWING',
          company: insertedJobs[0].company,
          job: insertedJobs[0]._id,
          history: [
            {
              status: 'PENDING',
              updatedAt: new Date(Date.now() - 86400000),
              updatedBy: { _id: demoCandidate._id, email: demoCandidate.email },
            },
            {
              status: 'REVIEWING',
              updatedAt: new Date(),
              updatedBy: { _id: createdUsers[1]._id, email: createdUsers[1].email },
            },
          ],
        },
        {
          email: demoCandidate.email,
          user: demoCandidate._id,
          url: '/images/resume/demo-cv.pdf',
          status: 'APPROVED',
          company: insertedJobs[1].company,
          job: insertedJobs[1]._id,
          history: [
            {
              status: 'PENDING',
              updatedAt: new Date(Date.now() - 172800000),
              updatedBy: { _id: demoCandidate._id, email: demoCandidate.email },
            },
            {
              status: 'APPROVED',
              updatedAt: new Date(),
              updatedBy: { _id: createdUsers[1]._id, email: createdUsers[1].email },
            },
          ],
        },
      ]);
      this.logger.log('Created sample resumes for candidate.');
    }

    this.logger.log('>>> Database Seeding Completed Successfully with 20 Jobs.');
  }

  // Phương thức hỗ trợ tạo 20 data bất cứ khi nào DB đã init trước đó
  async seedMockJobsIfEmpty() {
    const jobCount = await this.jobModel.countDocuments();
    if (jobCount >= 20) {
      return;
    }

    this.logger.log(`Current jobs count: ${jobCount}. Seeding 20 mock jobs...`);

    // Lấy hoặc tạo companies
    let companies = await this.companyModel.find();
    if (companies.length === 0) {
      for (const c of INIT_COMPANIES) {
        await this.companyModel.create({
          name: c.name,
          address: c.address,
          description: c.description,
          logo: c.logo,
        });
      }
      companies = await this.companyModel.find();
    }

    const companyMap = new Map<string, any>();
    for (const c of INIT_COMPANIES) {
      const match = companies.find((comp) => comp.name === c.name);
      if (match) {
        companyMap.set(c.code, match._id);
      }
    }

    const defaultCompId = companies[0]?._id;

    const jobsToInsert = INIT_JOBS_DATA.map((j) => {
      const compId = companyMap.get(j.companyCode) || defaultCompId;
      const now = new Date();
      const startDate = new Date(now.getTime() - Math.floor(Math.random() * 5) * 86400000);
      const endDate = new Date(now.getTime() + (20 + Math.floor(Math.random() * 30)) * 86400000);

      return {
        name: j.name,
        skills: j.skills,
        company: compId,
        location: j.location,
        salary: j.salary,
        quantity: j.quantity,
        level: j.level,
        description: j.description,
        startDate,
        endDate,
        isActive: true,
      };
    });

    await this.jobModel.insertMany(jobsToInsert);
    this.logger.log(`Successfully added 20 mock jobs to database.`);
  }
}

