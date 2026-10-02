import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, CodeOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../redux/hooks';
import { callRegister } from '../../config/api';

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.account);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await callRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (res && res.data) {
        message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (error: any) {
      message.error(error?.message || 'Đăng ký tài khoản thất bại');
    } finally {
      setLoading(false);
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
          maxWidth: 440,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Tạo tài khoản ứng viên</h2>
          <p style={{ color: '#888', marginTop: 4 }}>
            Khám phá cơ hội nghề nghiệp IT hấp dẫn nhất
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="candidate@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
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
              Đăng ký tài khoản
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: '#1677ff' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
};
