import React, { useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown, message } from 'antd';
import {
  BankOutlined,
  SolutionOutlined,
  FilePdfOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  HomeOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setLogout } from '../redux/slice/accountSlice';
import { callLogout } from '../config/api';
import { ALL_PERMISSIONS } from '../config/constants';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.account);

  const handleLogout = async () => {
    try {
      await callLogout();
    } catch {
      // Ignored
    } finally {
      dispatch(setLogout());
      message.success('Đăng xuất thành công');
      navigate('/login');
    }
  };

  // Tra cứu module người dùng có ít nhất 1 permission khớp method + apiPath
  const userModules = useMemo(() => {
    const modules = new Set<string>();
    if (!user?.permissions) return modules;

    const allPermsList = Object.values(ALL_PERMISSIONS).flatMap((m) =>
      Object.values(m),
    );

    user.permissions.forEach((userPerm) => {
      const matched = allPermsList.find(
        (p) =>
          p.method.toUpperCase() === userPerm.method.toUpperCase() &&
          p.apiPath === userPerm.apiPath,
      );
      if (matched) {
        modules.add(matched.module);
      }
    });

    return modules;
  }, [user]);

  const rawMenuItems = [
    {
      path: '/admin',
      name: 'Tổng quan',
      icon: <DashboardOutlined />,
      module: 'ALL',
    },
    {
      path: '/admin/companies',
      name: 'Công ty',
      icon: <BankOutlined />,
      module: 'COMPANIES',
    },
    {
      path: '/admin/jobs',
      name: 'Việc làm',
      icon: <SolutionOutlined />,
      module: 'JOBS',
    },
    {
      path: '/admin/resumes',
      name: 'CV ứng tuyển',
      icon: <FilePdfOutlined />,
      module: 'RESUMES',
    },
    {
      path: '/admin/users',
      name: 'Người dùng',
      icon: <UserOutlined />,
      module: 'USERS',
    },
    {
      path: '/admin/roles',
      name: 'Vai trò',
      icon: <SafetyCertificateOutlined />,
      module: 'ROLES',
    },
    {
      path: '/admin/permissions',
      name: 'Quyền hạn',
      icon: <KeyOutlined />,
      module: 'PERMISSIONS',
    },
  ];

  const menuRoute = useMemo(() => {
    const filteredRoutes = rawMenuItems.filter(
      (item) => item.module === 'ALL' || userModules.has(item.module),
    );
    return {
      path: '/admin',
      routes: filteredRoutes,
    };
  }, [userModules]);

  return (
    <ProLayout
      title="ITJobs Admin"
      layout="mix"
      location={{
        pathname: location.pathname,
      }}
      route={menuRoute}
      menuItemRender={(item, dom) => {
        if (!item.path || location.pathname === item.path) {
          return dom;
        }
        return <Link to={item.path}>{dom}</Link>;
      }}
      avatarProps={{
        src: undefined,
        title: user?.name || 'Admin',
        size: 'small',
        render: (_props, dom) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'home',
                    icon: <HomeOutlined />,
                    label: 'Về trang chủ',
                    onClick: () => navigate('/'),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    danger: true,
                    label: 'Đăng xuất',
                    onClick: handleLogout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {dom}
              </div>
            </Dropdown>
          );
        },
      }}
    >
      <div style={{ padding: '4px 0' }}>
        <Outlet />
      </div>
    </ProLayout>
  );
};
