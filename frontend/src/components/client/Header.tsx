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
            <div className={styles.logoIcon}>
              <CodeOutlined />
            </div>
            <div className={styles.logoText}>
              <span className={styles.brandPrimary}>IT</span>
              <span className={styles.brandDark}>Jobs</span>
              <span className={styles.brandBadge}>VN</span>
            </div>
          </Link>
          <nav className={styles.desktopNav}>
            <NavLink
              to="/job"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              <span>Việc làm IT</span>
              <span className={styles.navHotBadge}>HOT</span>
            </NavLink>
            <NavLink
              to="/company"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              Công ty công nghệ
            </NavLink>
          </nav>
        </div>

        <div className={styles.rightSection}>
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
              <div className={styles.userDropdownTrigger}>
                <Avatar
                  style={{
                    background: 'linear-gradient(135deg, #0052cc 0%, #0065ff 100%)',
                    fontWeight: 600,
                  }}
                  size="default"
                >
                  {user.name?.[0]?.toUpperCase() || <UserOutlined />}
                </Avatar>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>
                    {user?.role?.name === 'SUPER_ADMIN'
                      ? 'Admin'
                      : user?.role?.name === 'HR'
                      ? 'HR Recruiter'
                      : 'Ứng viên IT'}
                  </span>
                </div>
              </div>
            </Dropdown>
          ) : (
            <div className={styles.authButtons}>
              <Button
                type="text"
                className={styles.loginBtn}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                className={styles.registerBtn}
                onClick={() => navigate('/register')}
              >
                Tạo hồ sơ / Đăng ký
              </Button>
            </div>
          )}
        </div>

        <div className={styles.mobileTrigger}>
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
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
