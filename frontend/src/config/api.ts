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
