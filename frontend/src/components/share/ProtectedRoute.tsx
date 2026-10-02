import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { Result, Spin } from 'antd';
import { useAppSelector } from '../../redux/hooks';

interface IProps {
  admin?: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<IProps> = ({ admin = false, children }) => {
  const { isLoading, isAuthenticated, user } = useAppSelector(
    (state) => state.account,
  );
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?callback=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (admin && user?.role?.name === 'NORMAL_USER') {
    return (
      <Result
        status="403"
        title="403 - Truy cập bị từ chối"
        subTitle="Bạn không có quyền truy cập vào trang quản trị hệ thống."
      />
    );
  }

  return <>{children}</>;
};
