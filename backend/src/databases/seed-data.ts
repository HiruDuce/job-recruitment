export interface IPermissionInit {
  name: string;
  apiPath: string;
  method: string;
  module: string;
  seedRole?: 'HR' | 'NORMAL_USER' | 'ADMIN';
}

export const INIT_PERMISSIONS: IPermissionInit[] = [
  // USERS
  {
    name: 'Lấy danh sách người dùng',
    apiPath: '/api/v1/users',
    method: 'GET',
    module: 'USERS',
  },
  {
    name: 'Tạo mới người dùng',
    apiPath: '/api/v1/users',
    method: 'POST',
    module: 'USERS',
  },
  {
    name: 'Cập nhật người dùng',
    apiPath: '/api/v1/users/:id',
    method: 'PATCH',
    module: 'USERS',
  },
  {
    name: 'Xóa người dùng',
    apiPath: '/api/v1/users/:id',
    method: 'DELETE',
    module: 'USERS',
  },

  // ROLES
  {
    name: 'Lấy danh sách vai trò',
    apiPath: '/api/v1/roles',
    method: 'GET',
    module: 'ROLES',
  },
  {
    name: 'Tạo mới vai trò',
    apiPath: '/api/v1/roles',
    method: 'POST',
    module: 'ROLES',
  },
  {
    name: 'Cập nhật vai trò',
    apiPath: '/api/v1/roles/:id',
    method: 'PATCH',
    module: 'ROLES',
  },
  {
    name: 'Xóa vai trò',
    apiPath: '/api/v1/roles/:id',
    method: 'DELETE',
    module: 'ROLES',
  },

  // PERMISSIONS
  {
    name: 'Lấy danh sách quyền hạn',
    apiPath: '/api/v1/permissions',
    method: 'GET',
    module: 'PERMISSIONS',
  },
  {
    name: 'Tạo mới quyền hạn',
    apiPath: '/api/v1/permissions',
    method: 'POST',
    module: 'PERMISSIONS',
  },
  {
    name: 'Cập nhật quyền hạn',
    apiPath: '/api/v1/permissions/:id',
    method: 'PATCH',
    module: 'PERMISSIONS',
  },
  {
    name: 'Xóa quyền hạn',
    apiPath: '/api/v1/permissions/:id',
    method: 'DELETE',
    module: 'PERMISSIONS',
  },

  // COMPANIES
  {
    name: 'Tạo mới công ty',
    apiPath: '/api/v1/companies',
    method: 'POST',
    module: 'COMPANIES',
  },
  {
    name: 'Cập nhật công ty',
    apiPath: '/api/v1/companies/:id',
    method: 'PATCH',
    module: 'COMPANIES',
  },
  {
    name: 'Xóa công ty',
    apiPath: '/api/v1/companies/:id',
    method: 'DELETE',
    module: 'COMPANIES',
  },

  // JOBS
  {
    name: 'Quản lý danh sách việc làm (Admin/HR)',
    apiPath: '/api/v1/jobs/manage',
    method: 'GET',
    module: 'JOBS',
    seedRole: 'HR',
  },
  {
    name: 'Tạo mới việc làm',
    apiPath: '/api/v1/jobs',
    method: 'POST',
    module: 'JOBS',
    seedRole: 'HR',
  },
  {
    name: 'Cập nhật việc làm',
    apiPath: '/api/v1/jobs/:id',
    method: 'PATCH',
    module: 'JOBS',
    seedRole: 'HR',
  },
  {
    name: 'Xóa việc làm',
    apiPath: '/api/v1/jobs/:id',
    method: 'DELETE',
    module: 'JOBS',
    seedRole: 'HR',
  },

  // RESUMES
  {
    name: 'Nộp CV ứng tuyển',
    apiPath: '/api/v1/resumes',
    method: 'POST',
    module: 'RESUMES',
    seedRole: 'NORMAL_USER',
  },
  {
    name: 'Lấy danh sách CV (Admin/HR)',
    apiPath: '/api/v1/resumes',
    method: 'GET',
    module: 'RESUMES',
    seedRole: 'HR',
  },
  {
    name: 'Cập nhật trạng thái CV',
    apiPath: '/api/v1/resumes/:id',
    method: 'PATCH',
    module: 'RESUMES',
    seedRole: 'HR',
  },
  {
    name: 'Xóa CV',
    apiPath: '/api/v1/resumes/:id',
    method: 'DELETE',
    module: 'RESUMES',
  },
];
