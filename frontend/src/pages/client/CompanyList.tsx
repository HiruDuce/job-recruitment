import React, { useEffect, useState } from 'react';
import { Avatar, Card, Col, Empty, Input, Pagination, Row, Spin, Typography } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { callFetchCompanies } from '../../config/api';

const { Title, Text } = Typography;

export const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const query: any = {
          current,
          pageSize,
        };
        if (searchTerm.trim()) {
          query.name = searchTerm.trim();
        }

        const res = await callFetchCompanies(query);
        if (res.data) {
          setCompanies(res.data.result || []);
          setTotal(res.data.meta?.total || 0);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [current, pageSize, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 48 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #071527 0%, #0d274c 50%, #003a8c 100%)',
          borderRadius: 16,
          padding: '36px 32px 32px',
          color: '#ffffff',
          boxShadow: '0 12px 32px -8px rgba(2, 6, 23, 0.25)',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
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
            Khám Phá Công Ty IT Hàng Đầu
          </Title>
          <Text style={{ color: '#cbd5e1', fontSize: 14.5, marginTop: 6, display: 'block' }}>
            Tìm hiểu môi trường làm việc, văn hóa doanh nghiệp và cơ hội nghề nghiệp tại hơn 500+ công ty công nghệ
          </Text>

          <div style={{ marginTop: 24 }}>
            <Input
              size="large"
              placeholder="Nhập tên công ty công nghệ..."
              prefix={<SearchOutlined style={{ color: '#0052cc', marginRight: 4 }} />}
              allowClear
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrent(1);
              }}
              style={{
                borderRadius: 10,
                height: 48,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 20px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <Text style={{ fontSize: 15, color: '#334155' }}>
          Hiển thị <strong style={{ color: '#0052cc' }}>{total}</strong> doanh nghiệp công nghệ
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : companies.length > 0 ? (
        <>
          <Row gutter={[20, 20]}>
            {companies.map((company) => (
              <Col key={company._id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/company/${company._id}`)}
                  style={{
                    height: '100%',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.28s ease',
                  }}
                  styles={{
                    body: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'space-between',
                      padding: 24,
                    },
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        padding: 4,
                      }}
                    >
                      <Avatar
                        src={company.logo}
                        shape="square"
                        size={64}
                        style={{ objectFit: 'contain' }}
                      >
                        {company.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </div>

                    <Title
                      level={5}
                      ellipsis={{ rows: 2 }}
                      style={{ margin: 0, color: '#0f172a', textAlign: 'center', fontWeight: 700 }}
                    >
                      {company.name}
                    </Title>
                  </div>

                  <div style={{ marginTop: 14, width: '100%', textAlign: 'center' }}>
                    <Text
                      type="secondary"
                      ellipsis
                      style={{ display: 'block', fontSize: 13 }}
                    >
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {company.address}
                    </Text>

                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: '1px solid #f1f5f9',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#0052cc',
                      }}
                    >
                      Xem cơ hội việc làm →
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 16,
              background: '#ffffff',
              padding: '16px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
            }}
          >
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrent(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty
          description="Không tìm thấy công ty nào phù hợp với từ khóa"
          style={{ padding: '60px 0' }}
        />
      )}
    </div>
  );
};

export default CompanyList;
