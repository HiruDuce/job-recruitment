interface IBackendRes<T> {
  statusCode: number;
  message: string | string[];
  data?: T;
}

interface IModelPaginate<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

interface IPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IRole {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: IPermission[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

interface IAccount {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  company?: {
    _id: string;
    name: string;
  } | string;
  permissions: {
    method: string;
    apiPath: string;
  }[];
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: IRole | { _id: string; name: string };
  company?: ICompany | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ICompany {
  _id: string;
  name: string;
  address: string;
  description: string;
  logo: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IJob {
  _id: string;
  name: string;
  skills: string[];
  company: ICompany | { _id: string; name: string; logo?: string; address?: string };
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface IResumeHistory {
  status: string;
  updatedAt: string;
  updatedBy: {
    _id: string;
    email: string;
  };
}

interface IResume {
  _id: string;
  email: string;
  user: IUser | { _id: string; name: string; email?: string };
  url: string;
  status: string;
  company: ICompany | { _id: string; name: string; logo?: string };
  job: IJob | { _id: string; name: string };
  history: IResumeHistory[];
  createdAt?: string;
  updatedAt?: string;
}

interface ILoginRes {
  access_token: string;
  user: IAccount;
}
