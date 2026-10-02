import { createBrowserRouter } from 'react-router';
import { Result } from 'antd';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ProtectedRoute } from './components/share/ProtectedRoute';
import { PermissionPage } from './pages/admin/Permission';
import { RolePage } from './pages/admin/Role';
import { UserPage } from './pages/admin/User';
import { CompanyPage } from './pages/admin/Company';

const Placeholder = ({ name }: { name: string }) => (
  <div style={{ padding: 24, fontSize: 18 }}>
    <h2>{name}</h2>
    <p>Trang đang được xây dựng theo lộ trình các task tiếp theo...</p>
  </div>
);

const AdminGreeting = () => (
  <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
    <h2 style={{ margin: 0, color: '#1677ff' }}>Chào mừng đến với Trang quản trị ITJobs!</h2>
    <p style={{ marginTop: 8, color: '#666' }}>
      Vui lòng chọn các mục quản lý trên thanh điều hướng để bắt đầu làm việc.
    </p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { index: true, element: <Placeholder name="Trang chủ" /> },
      { path: 'job', element: <Placeholder name="Danh sách việc làm" /> },
      { path: 'job/:id', element: <Placeholder name="Chi tiết việc làm" /> },
      { path: 'company', element: <Placeholder name="Danh sách công ty" /> },
      { path: 'company/:id', element: <Placeholder name="Chi tiết công ty" /> },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <Placeholder name="Quản lý tài khoản & CV đã nộp" />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute admin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminGreeting /> },
      { path: 'companies', element: <CompanyPage /> },
      { path: 'jobs', element: <Placeholder name="Quản lý việc làm" /> },
      { path: 'resumes', element: <Placeholder name="Quản lý CV ứng tuyển" /> },
      { path: 'users', element: <UserPage /> },
      { path: 'roles', element: <RolePage /> },
      { path: 'permissions', element: <PermissionPage /> },
    ],
  },
  {
    path: '*',
    element: (
      <Result
        status="404"
        title="404 - Không tìm thấy trang"
        subTitle="Đường dẫn bạn truy cập không tồn tại hoặc đã bị gỡ bỏ."
      />
    ),
  },
]);
