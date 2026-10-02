import React from 'react';
import { Avatar, Space, Tag, Typography } from 'antd';
import {
  DollarCircleFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
  SafetyCertificateFilled,
} from '@ant-design/icons';
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

  // Kiểm tra job mới đăng trong vòng 7 ngày
  const isNewJob =
    job.createdAt && dayjs().diff(dayjs(job.createdAt), 'day') <= 7;

  return (
    <div
      className={styles.jobCard}
      onClick={() => navigate(`/job/${job._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/job/${job._id}`);
      }}
    >
      {/* Top Header Card */}
      <div className={styles.cardHeader}>
        <div className={styles.logoWrapper}>
          <Avatar
            src={company?.logo}
            shape="square"
            size={52}
            alt={company?.name}
            className={styles.companyLogo}
          >
            {(company?.name || job.name).charAt(0).toUpperCase()}
          </Avatar>
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <Title level={5} ellipsis={{ rows: 1 }} className={styles.jobTitle}>
              {job.name}
            </Title>
            {isNewJob && (
              <span className={styles.hotBadge}>
                <ThunderboltFilled /> HOT
              </span>
            )}
          </div>
          <div className={styles.companyRow}>
            <Text ellipsis className={styles.companyName}>
              {company?.name || 'Doanh nghiệp IT'}
            </Text>
            <SafetyCertificateFilled className={styles.verifyIcon} title="Nhà tuyển dụng đã xác thực" />
          </div>
        </div>
      </div>

      {/* Salary & Location Highlights */}
      <div className={styles.metaRow}>
        <div className={styles.salaryBadge}>
          <DollarCircleFilled className={styles.salaryIcon} />
          <span className={styles.salaryText}>
            {typeof job.salary === 'number'
              ? `${job.salary.toLocaleString('vi-VN')} đ`
              : 'Thỏa thuận'}
          </span>
        </div>

        <div className={styles.locationBadge}>
          <EnvironmentOutlined />
          <span>{locationLabel}</span>
        </div>

        <div className={styles.levelBadge}>
          <span>{job.level}</span>
        </div>
      </div>

      {/* Skills Badges */}
      <div className={styles.skillsContainer}>
        <Space wrap size={[6, 6]}>
          {job.skills?.slice(0, 4).map((skill) => (
            <Tag key={skill} className={styles.skillTag}>
              {skill}
            </Tag>
          ))}
          {job.skills && job.skills.length > 4 && (
            <Tag className={styles.moreSkillTag}>+{job.skills.length - 4}</Tag>
          )}
        </Space>
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <span className={styles.timePosted}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {job.createdAt ? dayjs(job.createdAt).fromNow() : 'Đang tuyển'}
        </span>
        <span className={styles.viewDetailText}>Xem chi tiết →</span>
      </div>
    </div>
  );
};

export default JobCard;
