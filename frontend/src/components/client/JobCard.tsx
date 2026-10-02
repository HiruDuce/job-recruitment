import React from 'react';
import { Avatar, Card, Space, Tag, Typography } from 'antd';
import { DollarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import { LOCATIONS } from '../../config/constants';
import styles from './ClientComponents.module.scss';

const { Text, Title } = Typography;

interface IProps {
  job: IJob;
}

export const JobCard: React.FC<IProps> = ({ job }) => {
  const navigate = useNavigate();

  const company = job.company as any;
  const locationLabel =
    LOCATIONS.find((l) => l.value === job.location)?.label || job.location;

  return (
    <Card
      className={styles.jobCard}
      hoverable
      onClick={() => navigate(`/job/${job._id}`)}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', gap: 12 } }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar
          src={company?.logo}
          shape="square"
          size={52}
          alt={company?.name}
          style={{ flexShrink: 0, objectFit: 'contain' }}
        >
          {(company?.name || job.name).charAt(0).toUpperCase()}
        </Avatar>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Title
            level={5}
            ellipsis={{ rows: 1 }}
            style={{ margin: 0, color: '#1677ff' }}
          >
            {job.name}
          </Title>
          <Text
            type="secondary"
            ellipsis
            style={{ display: 'block', fontSize: 13, marginTop: 2 }}
          >
            {company?.name || 'Công ty ẩn danh'}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
        <Space size={4}>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <Text strong style={{ color: '#d4380d' }}>
            {typeof job.salary === 'number'
              ? `${job.salary.toLocaleString('vi-VN')} đ`
              : 'Thỏa thuận'}
          </Text>
        </Space>

        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#888' }} />
          <Text type="secondary">{locationLabel}</Text>
        </Space>
      </div>

      <div style={{ flex: 1 }}>
        <Space wrap size={[4, 4]}>
          {job.skills?.slice(0, 4).map((skill) => (
            <Tag key={skill} color="blue" style={{ fontSize: 11, margin: 0 }}>
              {skill}
            </Tag>
          ))}
          {job.skills && job.skills.length > 4 && (
            <Tag style={{ fontSize: 11, margin: 0 }}>+{job.skills.length - 4}</Tag>
          )}
        </Space>
      </div>

      <div
        style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#8c8c8c',
        }}
      >
        <span>Cấp bậc: {job.level}</span>
        <span>{job.createdAt ? dayjs(job.createdAt).fromNow() : ''}</span>
      </div>
    </Card>
  );
};

export default JobCard;
