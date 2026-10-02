import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Breadcrumb,
  Card,
  Col,
  Empty,
  Row,
  Spin,
  Typography,
} from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router';
import DOMPurify from 'dompurify';
import { callFetchCompanyById, callFetchJobs } from '../../config/api';
import { JobCard } from '../../components/client/JobCard';

const { Title, Text } = Typography;

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [company, setCompany] = useState<ICompany | null>(null);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [compRes, jobsRes] = await Promise.all([
          callFetchCompanyById(id),
          callFetchJobs({ company: id, pageSize: 20 }),
        ]);

        if (compRes.data) {
          setCompany(compRes.data);
        }
        if (jobsRes.data) {
          setJobs(jobsRes.data.result || []);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>Không tìm thấy thông tin công ty</Title>
        <Link to="/company">
          <Text style={{ color: '#1677ff' }}>Quay lại danh sách công ty</Text>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/company">Danh sách công ty</Link> },
          { title: company.name },
        ]}
      />

      {/* Header Info */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            <Avatar
              src={company.logo}
              shape="square"
              size={96}
              style={{ objectFit: 'contain' }}
            >
              {company.name.charAt(0).toUpperCase()}
            </Avatar>
          </Col>

          <Col xs={24} sm={18} md={20}>
            <Title level={3} style={{ margin: 0 }}>
              {company.name}
            </Title>
            <div style={{ marginTop: 8 }}>
              <EnvironmentOutlined style={{ color: '#888', marginRight: 6 }} />
              <Text type="secondary" style={{ fontSize: 15 }}>
                {company.address}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Description */}
      <Card title="Giới thiệu công ty" style={{ marginBottom: 24, borderRadius: 12 }}>
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(company.description || ''),
          }}
          style={{ lineHeight: 1.8, fontSize: 15 }}
        />
      </Card>

      {/* Open Jobs */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            Vị trí tuyển dụng đang mở ({jobs.length})
          </Title>
          <Text type="secondary">Cơ hội việc làm đang tuyển dụng tại {company.name}</Text>
        </div>

        {jobs.length > 0 ? (
          <Row gutter={[16, 16]}>
            {jobs.map((job) => (
              <Col key={job._id} xs={24} md={12} lg={8}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="Hiện tại công ty chưa có vị trí tuyển dụng nào đang mở"
            style={{ padding: '40px 0' }}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
