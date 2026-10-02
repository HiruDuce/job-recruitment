import React, { useEffect, useState } from 'react';
import { Button, Col, Empty, Pagination, Row, Select, Spin, Typography } from 'antd';
import {
  FilterOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router';
import { callFetchJobs } from '../../config/api';
import { SearchBar } from '../../components/client/SearchBar';
import { JobCard } from '../../components/client/JobCard';
import { LEVELS } from '../../config/constants';

const { Title, Text } = Typography;

export const JobList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const skillsParam = searchParams.get('skills') || '';
  const locationParam = searchParams.get('location') || undefined;
  const levelParam = searchParams.get('level') || undefined;
  const currentParam = Number(searchParams.get('current')) || 1;

  const initialSkills = skillsParam ? skillsParam.split(',') : [];

  const PAGE_SIZE = 9;
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const query: any = {
          current: currentParam,
          pageSize: PAGE_SIZE,
        };
        if (skillsParam) query.skills = skillsParam;
        if (locationParam) query.location = locationParam;
        if (levelParam) query.level = levelParam;

        const res = await callFetchJobs(query);
        if (res.data) {
          setJobs(res.data.result || []);
          setTotal(res.data.meta?.total || 0);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [skillsParam, locationParam, levelParam, currentParam]);

  const handleLevelChange = (val?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val) {
      nextParams.set('level', val);
    } else {
      nextParams.delete('level');
    }
    nextParams.set('current', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('current', page.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilterActive = Boolean(skillsParam || locationParam || levelParam);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 48 }}>
      {/* Search Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #071527 0%, #0d274c 50%, #003a8c 100%)',
          borderRadius: 16,
          padding: '36px 32px 32px',
          color: '#ffffff',
          boxShadow: '0 12px 32px -8px rgba(2, 6, 23, 0.25)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title
              level={2}
              style={{
                color: '#ffffff',
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.3px',
              }}
            >
              Tìm Kiếm Việc Làm IT Toàn Quốc
            </Title>
            <Text style={{ color: '#cbd5e1', fontSize: 14.5, marginTop: 6, display: 'block' }}>
              Tiếp cận hơn 10,000+ vị trí tuyển dụng IT hấp dẫn từ các công ty công nghệ hàng đầu
            </Text>
          </div>

          <SearchBar
            key={searchParams.toString()}
            initialSkills={initialSkills}
            initialLocation={locationParam}
            showQuickTags={false}
          />
        </div>
      </div>

      {/* Filter and stats toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined style={{ color: '#0052cc', fontSize: 18 }} />
          <Text style={{ fontSize: 15, color: '#334155' }}>
            Tìm thấy{' '}
            <strong style={{ color: '#0052cc', fontSize: 17 }}>{total}</strong> việc làm phù hợp
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#64748b' }} />
            <Text type="secondary" style={{ fontSize: 13.5, fontWeight: 500 }}>
              Cấp bậc:
            </Text>
            <Select
              style={{ width: 170 }}
              placeholder="Tất cả cấp bậc"
              allowClear
              value={levelParam}
              onChange={handleLevelChange}
              options={LEVELS}
            />
          </div>

          {hasFilterActive && (
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              size="middle"
              style={{ fontSize: 13 }}
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : jobs.length > 0 ? (
        <>
          <Row gutter={[20, 20]}>
            {jobs.map((job) => (
              <Col key={job._id} xs={24} md={12} lg={8}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 20,
              background: '#ffffff',
              padding: '16px 24px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
            }}
          >
            <Pagination
              current={currentParam}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <Empty
            description={
              <div>
                <Title level={4} style={{ color: '#0f172a', marginBottom: 8 }}>
                  Không tìm thấy việc làm IT phù hợp
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Hãy thử điều chỉnh lại kỹ năng, cấp bậc hoặc từ khóa tìm kiếm của bạn.
                </Text>
              </div>
            }
          >
            {hasFilterActive && (
              <Button type="primary" onClick={handleResetFilters} style={{ marginTop: 12 }}>
                Xóa tất cả bộ lọc
              </Button>
            )}
          </Empty>
        </div>
      )}
    </div>
  );
};

export default JobList;
