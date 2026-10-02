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
import { INIT_PERMISSIONS } from './seed-data';

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
  ) {}

  async onModuleInit() {
    const shouldInit = this.configService.get<string>('SHOULD_INIT');
    if (shouldInit !== 'true') {
      return;
    }

    const countPermissions = await this.permissionModel.countDocuments();
    if (countPermissions > 0) {
      this.logger.log('Database already initialized. Skip seeding.');
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

    // 4. Create Demo Company
    const demoCompany = await this.companyModel.create({
      name: 'Google Vietnam Tech Corp',
      address: 'Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
      description: '<p>Công ty công nghệ hàng đầu thế giới về trí tuệ nhân tạo và tìm kiếm.</p>',
      logo: '/images/company/google-demo.png',
    });
    this.logger.log(`Created Demo Company: ${demoCompany.name}`);

    // 5. Create Users
    const adminEmail =
      this.configService.getOrThrow<string>('ADMIN_EMAIL');
    const adminPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.userModel.create([
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
    this.logger.log('>>> Database Seeding Completed Successfully.');
  }
}
