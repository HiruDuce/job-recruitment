import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Mutex } from 'async-mutex';
import { setLogin, setLogout } from '../redux/slice/accountSlice';

let reduxStore: any = null;

export const injectStore = (store: any) => {
  reduxStore = store;
};

const instance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

const mutex = new Mutex();

export async function refreshToken(): Promise<string | null> {
  const previousToken = reduxStore?.getState()?.account?.accessToken;

  return mutex.runExclusive(async () => {
    const currentToken = reduxStore?.getState()?.account?.accessToken;

    // Request khác trong hàng đợi vừa refresh xong
    if (currentToken !== previousToken) {
      return currentToken;
    }

    try {
      const res = await axios.get<IBackendRes<ILoginRes>>('/api/v1/auth/refresh', {
        headers: {
          'x-no-retry': 'true',
        },
        withCredentials: true,
      });

      if (res.data && res.data.data) {
        reduxStore?.dispatch(setLogin(res.data.data));
        return res.data.data.access_token;
      }
      reduxStore?.dispatch(setLogout());
      return null;
    } catch {
      reduxStore?.dispatch(setLogout());
      return null;
    }
  });
}

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = reduxStore?.getState()?.account?.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (res) => res.data,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.headers?.['x-no-retry'] &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers['x-no-retry'] = 'true';
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      }
    }

    return Promise.reject(error.response?.data ?? error);
  },
);

export default instance;
