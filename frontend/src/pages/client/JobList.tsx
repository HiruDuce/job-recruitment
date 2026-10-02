import React, { useEffect, useState } from 'react';
import { Col, Empty, Pagination, Row, Select, Spin, Typography } from 'antd';
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48 }}>
      {/* Search Header */}
      <div>
        <Title level={2} style={{ marginBottom: 16 }}>
          Tìm kiếm việc làm IT
        </Title>
        <SearchBar
          key={searchParams.toString()}
          initialSkills={initialSkills}
          initialLocation={locationParam}
        />
      </div>

      {/* Filter and stats row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Text type="secondary">
          Tìm thấy <Text strong style={{ color: '#1677ff' }}>{total}</Text> việc làm phù hợp
        </Text>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary">Cấp bậc:</Text>
          <Select
            style={{ width: 180 }}
            placeholder="Tất cả cấp bậc"
            allowClear
            value={levelParam}
            onChange={handleLevelChange}
            options={LEVELS}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : jobs.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {jobs.map((job) => (
              <Col key={job._id} xs={24} md={12} lg={8}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={currentParam}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <Empty
          description="Không tìm thấy việc làm IT nào phù hợp với yêu cầu tìm kiếm của bạn"
          style={{ padding: '60px 0' }}
        />
      )}
    </div>
  );
};

export default JobList;
