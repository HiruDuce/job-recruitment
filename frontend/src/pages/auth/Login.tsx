import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined, CodeOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setLogin } from '../../redux/slice/accountSlice';
import { callLogin } from '../../config/api';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.account);

  // Đã login mà vào /login -> redirect /
  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await callLogin(values.email, values.password);
      if (res && res.data) {
        dispatch(setLogin(res.data));
        message.success('Đăng nhập thành công');

        const callback = searchParams.get('callback');
        if (callback && callback.startsWith('/') && !callback.startsWith('//')) {
          navigate(callback, { replace: true });
        } else {
          const roleName = res.data.user?.role?.name;
          if (roleName && roleName !== 'NORMAL_USER') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      }
    } catch (error: any) {
      setLoading(false);
      message.error(error?.message || 'Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#e6f4ff',
              color: '#1677ff',
              fontSize: 26,
              marginBottom: 12,
            }}
          >
            <CodeOutlined />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Đăng nhập ITJobs</h2>
          <p style={{ color: '#888', marginTop: 4 }}>
            Chào mừng bạn quay trở lại với cộng đồng IT
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="name@domain.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ fontWeight: 600 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: '#1677ff' }}>
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </div>
  );
};
