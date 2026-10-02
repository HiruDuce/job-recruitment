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

export const callRefreshToken = (): Promise<IBackendRes<ILoginRes>> => {
  return axios.get('/auth/refresh');
};
