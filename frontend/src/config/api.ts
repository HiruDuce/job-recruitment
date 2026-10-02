import axios from './axios-customize';

// AUTH APIs
export const callLogin = (email: string, password: string): Promise<IBackendRes<ILoginRes>> => {
  return axios.post('/auth/login', { email, password });
};

export const callRegister = (data: {
  name: string;
  email: string;
  password: string;
}): Promise<IBackendRes<{ _id: string; createdAt: string }>> => {
  return axios.post('/auth/register', data);
};

export const callLogout = (): Promise<IBackendRes<any>> => {
  return axios.post('/auth/logout');
};

// PERMISSIONS APIs
export const callFetchPermissions = (params: any): Promise<IBackendRes<IModelPaginate<IPermission>>> => {
  return axios.get('/permissions', { params });
};

export const callCreatePermission = (data: Partial<IPermission>): Promise<IBackendRes<{ _id: string }>> => {
  return axios.post('/permissions', data);
};

export const callUpdatePermission = (id: string, data: Partial<IPermission>): Promise<IBackendRes<IPermission>> => {
  return axios.patch(`/permissions/${id}`, data);
};

export const callDeletePermission = (id: string): Promise<IBackendRes<any>> => {
  return axios.delete(`/permissions/${id}`);
};

// ROLES APIs
export const callFetchRoles = (params: any): Promise<IBackendRes<IModelPaginate<IRole>>> => {
  return axios.get('/roles', { params });
};

export const callCreateRole = (data: any): Promise<IBackendRes<{ _id: string }>> => {
  return axios.post('/roles', data);
};

export const callUpdateRole = (id: string, data: any): Promise<IBackendRes<IRole>> => {
  return axios.patch(`/roles/${id}`, data);
};

export const callDeleteRole = (id: string): Promise<IBackendRes<any>> => {
  return axios.delete(`/roles/${id}`);
};

// Users
export const callFetchUsers = (params: any): Promise<IBackendRes<IModelPaginate<IUser>>> => {
  return axios.get('/users', { params });
};

export const callCreateUser = (data: any): Promise<IBackendRes<IUser>> => {
  return axios.post('/users', data);
};

export const callUpdateUser = (id: string, data: any): Promise<IBackendRes<IUser>> => {
  return axios.patch(`/users/${id}`, data);
};

export const callDeleteUser = (id: string): Promise<IBackendRes<any>> => {
  return axios.delete(`/users/${id}`);
};

// Files
export const callUploadFile = (file: File, folder: string): Promise<IBackendRes<{ url: string }>> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  return axios.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Companies
export const callFetchCompanies = (params?: any): Promise<IBackendRes<IModelPaginate<ICompany>>> => {
  return axios.get('/companies', { params });
};

export const callCreateCompany = (data: any): Promise<IBackendRes<ICompany>> => {
  return axios.post('/companies', data);
};

export const callUpdateCompany = (id: string, data: any): Promise<IBackendRes<ICompany>> => {
  return axios.patch(`/companies/${id}`, data);
};

export const callDeleteCompany = (id: string): Promise<IBackendRes<any>> => {
  return axios.delete(`/companies/${id}`);
};

// Jobs
export const callFetchJobsManage = (params: any): Promise<IBackendRes<IModelPaginate<IJob>>> => {
  return axios.get('/jobs/manage', { params });
};

export const callCreateJob = (data: any): Promise<IBackendRes<IJob>> => {
  return axios.post('/jobs', data);
};

export const callUpdateJob = (id: string, data: any): Promise<IBackendRes<IJob>> => {
  return axios.patch(`/jobs/${id}`, data);
};

export const callDeleteJob = (id: string): Promise<IBackendRes<any>> => {
  return axios.delete(`/jobs/${id}`);
};

// Resumes
export const callFetchResumes = (params: any): Promise<IBackendRes<IModelPaginate<IResume>>> => {
  return axios.get('/resumes', { params });
};

export const callUpdateResumeStatus = (id: string, status: string): Promise<IBackendRes<IResume>> => {
  return axios.patch(`/resumes/${id}`, { status });
};

export const callDeleteResume = (id: string): Promise<IBackendRes<any>> => {
  return axios.delete(`/resumes/${id}`);
};

// Public Jobs & Companies
export const callFetchJobs = (params?: any): Promise<IBackendRes<IModelPaginate<IJob>>> => {
  return axios.get('/jobs', { params });
};

export const callFetchJobById = (id: string): Promise<IBackendRes<IJob>> => {
  return axios.get(`/jobs/${id}`);
};

export const callFetchCompanyById = (id: string): Promise<IBackendRes<ICompany>> => {
  return axios.get(`/companies/${id}`);
};

export const callCreateResume = (data: { url: string; job: string }): Promise<IBackendRes<IResume>> => {
  return axios.post('/resumes', data);
};

export const callFetchMyResumes = (): Promise<IBackendRes<IResume[]>> => {
  return axios.get('/resumes/me');
};


