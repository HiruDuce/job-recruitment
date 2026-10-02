import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  MenuProps,
  message,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MenuOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setLogout } from '../../redux/slice/accountSlice';
import { callLogout } from '../../config/api';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.account);

  const handleLogout = async () => {
    try {
      await callLogout();
    } catch {
      // Ignored
    } finally {
      dispatch(setLogout());
      message.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  const isNotNormalUser =
    user?.role?.name && user.role.name !== 'NORMAL_USER';

  const menuItems: MenuProps['items'] = [
    {
      key: 'account',
      icon: <UserOutlined />,
      label: <Link to="/account">Tài khoản</Link>,
    },
    ...(isNotNormalUser
      ? [
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Trang quản trị</Link>,
          },
        ]
      : []),
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
  ];

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            <CodeOutlined style={{ fontSize: 24 }} />
            <span>ITJobs</span>
          </Link>
          <nav className={styles.desktopNav}>
            <NavLink
              to="/job"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              Việc làm IT
            </NavLink>
            <NavLink
              to="/company"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              Công ty
            </NavLink>
          </nav>
        </div>

        <div className={styles.rightSection}>
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
              <div className={styles.userDropdownTrigger}>
                <Avatar style={{ backgroundColor: '#1677ff' }}>
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <span className={styles.userName}>{user.name}</span>
              </div>
            </Dropdown>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="default" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                Đăng ký
              </Button>
            </div>
          )}
        </div>

        <div className={styles.mobileTrigger}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
          />
        </div>
      </div>

      <Drawer
        title="Menu ITJobs"
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link
            to="/job"
            onClick={() => setMobileOpen(false)}
            style={{ fontSize: 16, fontWeight: 500 }}
          >
            Việc làm IT
          </Link>
          <Link
            to="/company"
            onClick={() => setMobileOpen(false)}
            style={{ fontSize: 16, fontWeight: 500 }}
          >
            Công ty
          </Link>
          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0' }} />
          {isAuthenticated && user ? (
            <>
              <div style={{ fontWeight: 600, color: '#1677ff' }}>
                Xin chào, {user.name}
              </div>
              <Link to="/account" onClick={() => setMobileOpen(false)}>
                Hồ sơ cá nhân & CV
              </Link>
              {isNotNormalUser && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  Trang quản trị
                </Link>
              )}
              <Button danger onClick={handleLogout} style={{ marginTop: 8 }}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button
                type="default"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/login');
                }}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/register');
                }}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
};
