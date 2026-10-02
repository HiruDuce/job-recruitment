export const ALL_PERMISSIONS = {
  USERS: {
    GET_PAGINATE: { method: 'GET', apiPath: '/api/v1/users', module: 'USERS' },
    CREATE: { method: 'POST', apiPath: '/api/v1/users', module: 'USERS' },
    UPDATE: { method: 'PATCH', apiPath: '/api/v1/users/:id', module: 'USERS' },
    DELETE: { method: 'DELETE', apiPath: '/api/v1/users/:id', module: 'USERS' },
  },
  ROLES: {
    GET_PAGINATE: { method: 'GET', apiPath: '/api/v1/roles', module: 'ROLES' },
    CREATE: { method: 'POST', apiPath: '/api/v1/roles', module: 'ROLES' },
    UPDATE: { method: 'PATCH', apiPath: '/api/v1/roles/:id', module: 'ROLES' },
    DELETE: { method: 'DELETE', apiPath: '/api/v1/roles/:id', module: 'ROLES' },
  },
  PERMISSIONS: {
    GET_PAGINATE: { method: 'GET', apiPath: '/api/v1/permissions', module: 'PERMISSIONS' },
    CREATE: { method: 'POST', apiPath: '/api/v1/permissions', module: 'PERMISSIONS' },
    UPDATE: { method: 'PATCH', apiPath: '/api/v1/permissions/:id', module: 'PERMISSIONS' },
    DELETE: { method: 'DELETE', apiPath: '/api/v1/permissions/:id', module: 'PERMISSIONS' },
  },
  COMPANIES: {
    CREATE: { method: 'POST', apiPath: '/api/v1/companies', module: 'COMPANIES' },
    UPDATE: { method: 'PATCH', apiPath: '/api/v1/companies/:id', module: 'COMPANIES' },
    DELETE: { method: 'DELETE', apiPath: '/api/v1/companies/:id', module: 'COMPANIES' },
  },
  JOBS: {
    GET_MANAGE: { method: 'GET', apiPath: '/api/v1/jobs/manage', module: 'JOBS' },
    CREATE: { method: 'POST', apiPath: '/api/v1/jobs', module: 'JOBS' },
    UPDATE: { method: 'PATCH', apiPath: '/api/v1/jobs/:id', module: 'JOBS' },
    DELETE: { method: 'DELETE', apiPath: '/api/v1/jobs/:id', module: 'JOBS' },
  },
  RESUMES: {
    CREATE: { method: 'POST', apiPath: '/api/v1/resumes', module: 'RESUMES' },
    GET_PAGINATE: { method: 'GET', apiPath: '/api/v1/resumes', module: 'RESUMES' },
    UPDATE: { method: 'PATCH', apiPath: '/api/v1/resumes/:id', module: 'RESUMES' },
    DELETE: { method: 'DELETE', apiPath: '/api/v1/resumes/:id', module: 'RESUMES' },
  },
};

export const SKILLS = [
  'REACTJS',
  'NODEJS',
  'TYPESCRIPT',
  'JAVASCRIPT',
  'NESTJS',
  'NEXTJS',
  'VUEJS',
  'PYTHON',
  'GOLANG',
  'JAVA',
  'PHP',
  'FLUTTER',
  'REACT NATIVE',
  'DOCKER',
  'KUBERNETES',
  'AWS',
];

export const LOCATIONS = [
  { value: 'HANOI', label: 'Hà Nội' },
  { value: 'HOCHIMINH', label: 'Hồ Chí Minh' },
  { value: 'DANANG', label: 'Đà Nẵng' },
  { value: 'OTHER', label: 'Khác' },
];

export const LEVELS = [
  { value: 'INTERN', label: 'Thực tập sinh (Intern)' },
  { value: 'FRESHER', label: 'Mới tốt nghiệp (Fresher)' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MIDDLE', label: 'Middle' },
  { value: 'SENIOR', label: 'Senior' },
];

export const RESUME_STATUS = [
  { value: 'PENDING', label: 'Chờ duyệt', color: 'orange' },
  { value: 'REVIEWING', label: 'Đang xem xét', color: 'blue' },
  { value: 'APPROVED', label: 'Đã duyệt', color: 'green' },
  { value: 'REJECTED', label: 'Từ chối', color: 'red' },
];
