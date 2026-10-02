import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Col, Row, Spin, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { callFetchCompanies, callFetchJobs } from '../../config/api';
import { SearchBar } from '../../components/client/SearchBar';
import { JobCard } from '../../components/client/JobCard';
import styles from './ClientPages.module.scss';

const { Title, Text } = Typography;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [latestJobs, setLatestJobs] = useState<IJob[]>([]);
  const [featuredCompanies, setFeaturedCompanies] = useState<ICompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, compsRes] = await Promise.all([
          callFetchJobs({ pageSize: 6 }),
          callFetchCompanies({ pageSize: 4 }),
        ]);

        if (jobsRes.data?.result) {
          setLatestJobs(jobsRes.data.result);
        }
        if (compsRes.data?.result) {
          setFeaturedCompanies(compsRes.data.result);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Title level={1} className={styles.heroTitle}>
          Khám Phá Cơ Hội Việc Làm IT Hàng Đầu
        </Title>
        <p className={styles.heroSubtitle}>
          Kết nối lập trình viên tài năng với hàng ngàn doanh nghiệp công nghệ uy tín trên toàn quốc.
        </p>
        <div className={styles.heroSearchWrap}>
          <SearchBar />
        </div>
      </section>

      {/* Việc làm mới nhất */}
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Việc làm mới nhất
            </Title>
            <Text type="secondary">Cơ hội việc làm IT hấp dẫn vừa được đăng tuyển</Text>
          </div>
          <Link to="/job">
            <Button type="link" iconPosition="end" icon={<ArrowRightOutlined />}>
              Xem tất cả
            </Button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {latestJobs.map((job) => (
              <Col key={job._id} xs={24} md={12} lg={8}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Công ty nổi bật */}
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Công ty nổi bật
            </Title>
            <Text type="secondary">Những môi trường làm việc công nghệ lý tưởng hàng đầu</Text>
          </div>
          <Link to="/company">
            <Button type="link" iconPosition="end" icon={<ArrowRightOutlined />}>
              Xem tất cả
            </Button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {featuredCompanies.map((company) => (
              <Col key={company._id} xs={24} sm={12} md={6}>
                <Card
                  className={styles.companyCard}
                  hoverable
                  onClick={() => navigate(`/company/${company._id}`)}
                >
                  <Avatar
                    src={company.logo}
                    shape="square"
                    size={64}
                    style={{ marginBottom: 12, objectFit: 'contain' }}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Title level={5} ellipsis={{ rows: 1 }} style={{ margin: 0 }}>
                    {company.name}
                  </Title>
                  <Text
                    type="secondary"
                    ellipsis
                    style={{ display: 'block', fontSize: 13, marginTop: 4 }}
                  >
                    {company.address}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>
    </div>
  );
};

export default Home;
