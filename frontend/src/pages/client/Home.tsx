import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Col, Row, Spin, Typography } from 'antd';
import {
  ArrowRightOutlined,
  FireFilled,
  BankFilled,
  RocketFilled,
  SafetyCertificateFilled,
  UsergroupAddOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
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
        <div className={styles.heroBadge}>
          <RocketFilled style={{ color: '#38bdf8' }} />
          <span>Nền tảng tuyển dụng nhân tài IT hàng đầu Việt Nam</span>
        </div>

        <h1 className={styles.heroTitle}>
          Khám Phá Cơ Hội <span className={styles.heroTitleHighlight}>Việc Làm IT</span> Mơ Ước
        </h1>

        <p className={styles.heroSubtitle}>
          Kết nối lập trình viên tài năng với hơn 500+ doanh nghiệp và tập đoàn công nghệ tiên phong tại Việt Nam & quốc tế.
        </p>

        {/* Thanh tìm kiếm trung tâm */}
        <div className={styles.heroSearchWrap}>
          <SearchBar showQuickTags={true} />
        </div>

        {/* Thống kê tin cậy */}
        <div className={styles.heroStatsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>10,000+</span>
            <span className={styles.statLabel}>Việc làm IT đang tuyển</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>500+</span>
            <span className={styles.statLabel}>Doanh nghiệp hàng đầu</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>250,000+</span>
            <span className={styles.statLabel}>Ứng viên tài năng</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>98%</span>
            <span className={styles.statLabel}>Phản hồi tích cực</span>
          </div>
        </div>
      </section>

      {/* Việc làm mới nhất & HOT */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionBadge}>
              <FireFilled style={{ color: '#ef4444' }} /> VIỆC LÀM MỚI NHẤT
            </div>
            <Title level={2} className={styles.sectionTitle}>
              Cơ Hội Việc Làm IT Nổi Bật
            </Title>
            <Text type="secondary" className={styles.sectionDesc}>
              Các vị trí kỹ sư phần mềm, frontend, backend, devops vừa được đăng tuyển
            </Text>
          </div>
          <Link to="/job">
            <Button
              type="link"
              className={styles.viewAllBtn}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              Xem tất cả việc làm
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {latestJobs.map((job) => (
              <Col key={job._id} xs={24} md={12} lg={8}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Công ty công nghệ hàng đầu */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionBadge}>
              <BankFilled style={{ color: '#0052cc' }} /> DOANH NGHIỆP HÀNG ĐẦU
            </div>
            <Title level={2} className={styles.sectionTitle}>
              Nhà Tuyển Dụng Công Nghệ Nổi Bật
            </Title>
            <Text type="secondary" className={styles.sectionDesc}>
              Môi trường làm việc năng động, chế độ đãi ngộ vượt trội và cơ hội phát triển bền vững
            </Text>
          </div>
          <Link to="/company">
            <Button
              type="link"
              className={styles.viewAllBtn}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              Xem tất cả công ty
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {featuredCompanies.map((company) => (
              <Col key={company._id} xs={24} sm={12} md={6}>
                <Card
                  className={styles.companyCard}
                  hoverable
                  onClick={() => navigate(`/company/${company._id}`)}
                >
                  <div className={styles.companyLogoBox}>
                    <Avatar
                      src={company.logo}
                      shape="square"
                      size={68}
                      className={styles.companyAvatar}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </div>
                  <Title level={5} ellipsis={{ rows: 1 }} className={styles.companyCardTitle}>
                    {company.name}
                  </Title>
                  <Text
                    type="secondary"
                    ellipsis
                    className={styles.companyAddress}
                  >
                    {company.address}
                  </Text>
                  <div className={styles.companyCardAction}>
                    <span>Xem việc làm đang tuyển →</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Banner Nhà tuyển dụng */}
      <section className={styles.recruiterBanner}>
        <div className={styles.recruiterContent}>
          <div className={styles.recruiterBadge}>
            <SafetyCertificateFilled /> Dành Cho Nhà Tuyển Dụng
          </div>
          <h2 className={styles.recruiterTitle}>
            Tìm Kiếm & Tuyển Dụng Nhân Tài IT Hàng Đầu Cùng ITJobs
          </h2>
          <p className={styles.recruiterDesc}>
            Tiếp cận hơn 250,000+ hồ sơ kỹ sư công nghệ thông tin chất lượng cao. Đăng tin nhanh chóng, quản lý ứng viên thông minh và tối ưu chi phí tuyển dụng.
          </p>
          <div className={styles.recruiterFeatures}>
            <div className={styles.featureItem}>
              <CheckCircleFilled className={styles.checkIcon} />
              <span>Đăng tin tuyển dụng không giới hạn</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircleFilled className={styles.checkIcon} />
              <span>Duyệt hồ sơ & CV ứng viên trực tuyến</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircleFilled className={styles.checkIcon} />
              <span>Hỗ trợ kỹ thuật 24/7 từ chuyên viên IT</span>
            </div>
          </div>
          <div className={styles.recruiterActions}>
            <Button
              type="primary"
              size="large"
              className={styles.recruiterBtnPrimary}
              onClick={() => navigate('/login')}
            >
              Đăng tin tuyển dụng ngay
            </Button>
            <Button
              size="large"
              className={styles.recruiterBtnSecondary}
              onClick={() => navigate('/register')}
            >
              Đăng ký tài khoản tuyển dụng
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
