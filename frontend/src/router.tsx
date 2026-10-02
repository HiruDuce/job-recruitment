import { createBrowserRouter } from 'react-router';

const Placeholder = ({ name }: { name: string }) => (
  <div style={{ padding: 24, fontSize: 18 }}>
    <h2>{name}</h2>
    <p>Trang đang được xây dựng theo lộ trình các task tiếp theo...</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Placeholder name="Client Layout" />,
    children: [
      { index: true, element: <Placeholder name="Trang chủ" /> },
      { path: 'job', element: <Placeholder name="Danh sách việc làm" /> },
      { path: 'job/:id', element: <Placeholder name="Chi tiết việc làm" /> },
      { path: 'company', element: <Placeholder name="Danh sách công ty" /> },
      { path: 'company/:id', element: <Placeholder name="Chi tiết công ty" /> },
      { path: 'account', element: <Placeholder name="Quản lý tài khoản & CV đã nộp" /> },
    ],
  },
  {
    path: '/login',
    element: <Placeholder name="Đăng nhập" />,
  },
  {
    path: '/register',
    element: <Placeholder name="Đăng ký" />,
  },
  {
    path: '/admin',
    element: <Placeholder name="Admin Layout" />,
    children: [
      { index: true, element: <Placeholder name="Admin Dashboard" /> },
      { path: 'users', element: <Placeholder name="Quản lý người dùng" /> },
      { path: 'roles', element: <Placeholder name="Quản lý vai trò" /> },
      { path: 'permissions', element: <Placeholder name="Quản lý quyền hạn" /> },
      { path: 'companies', element: <Placeholder name="Quản lý công ty" /> },
      { path: 'jobs', element: <Placeholder name="Quản lý việc làm" /> },
      { path: 'resumes', element: <Placeholder name="Quản lý CV ứng tuyển" /> },
    ],
  },
]);
