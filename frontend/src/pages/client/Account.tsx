import React, { useEffect, useState } from 'react';
import { Card, Table, Tabs, Tag, Typography } from 'antd';
import { FilePdfOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { callFetchMyResumes } from '../../config/api';
import { RESUME_STATUS } from '../../config/constants';
import { useAppSelector } from '../../redux/hooks';

const { Title, Text } = Typography;

export const Account: React.FC = () => {
  const { user } = useAppSelector((state) => state.account);
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      try {
        const res = await callFetchMyResumes();
        if (res.data) {
          setResumes(res.data);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const getStatusTag = (status: string) => {
    const config = RESUME_STATUS.find((s) => s.value === status);
    return <Tag color={config?.color || 'default'}>{config?.label || status}</Tag>;
  };

  const columns: ColumnsType<IResume> = [
    {
      title: 'Công việc',
      dataIndex: 'job',
      key: 'job',
      render: (job: any) =>
        job?._id ? (
          <Link to={`/job/${job._id}`} style={{ fontWeight: 500, color: '#1677ff' }}>
            {job.name}
          </Link>
        ) : (
          job?.name || '-'
        ),
    },
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
      render: (comp: any) => comp?.name || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'File CV',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <FilePdfOutlined style={{ color: '#ff4d4f' }} />
            Xem CV
          </a>
        ) : (
          '-'
        ),
    },
  ];

  const tabItems = [
    {
      key: 'resumes',
      label: 'CV đã ứng tuyển',
      children: (
        <Table<IResume>
          columns={columns}
          dataSource={resumes}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      children: (
        <div style={{ maxWidth: 500, padding: '12px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Họ và tên</Text>
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
              {user?.name || '-'}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Địa chỉ Email</Text>
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
              {user?.email || '-'}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Vai trò</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">{user?.role?.name || 'NORMAL_USER'}</Tag>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <UserOutlined style={{ fontSize: 24, color: '#1677ff' }} />
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Tài khoản của tôi
          </Title>
          <Text type="secondary">Quản lý hồ sơ và theo dõi trạng thái các việc làm đã ứng tuyển</Text>
        </div>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Tabs defaultActiveKey="resumes" items={tabItems} />
      </Card>
    </div>
  );
};

export default Account;
