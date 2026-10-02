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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48 }}>
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          Danh sách công ty IT hàng đầu
        </Title>
        <Text type="secondary">
          Tìm hiểu văn hóa, chế độ đãi ngộ và môi trường làm việc tại các công ty công nghệ
        </Text>
      </div>

      <div style={{ maxWidth: 450 }}>
        <Input
          size="large"
          placeholder="Tìm theo tên công ty..."
          prefix={<SearchOutlined style={{ color: '#888' }} />}
          allowClear
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrent(1);
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : companies.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {companies.map((company) => (
              <Col key={company._id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/company/${company._id}`)}
                  style={{ height: '100%', borderRadius: 10, textAlign: 'center' }}
                  styles={{
                    body: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'space-between',
                      padding: 20,
                    },
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                      src={company.logo}
                      shape="square"
                      size={72}
                      style={{ marginBottom: 16, objectFit: 'contain' }}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: 0, color: '#1677ff' }}>
                      {company.name}
                    </Title>
                  </div>

                  <div style={{ marginTop: 12, width: '100%' }}>
                    <Text
                      type="secondary"
                      ellipsis
                      style={{ display: 'block', fontSize: 13 }}
                    >
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {company.address}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrent(page)}
            />
          </div>
        </>
      ) : (
        <Empty
          description="Không tìm thấy công ty nào phù hợp"
          style={{ padding: '60px 0' }}
        />
      )}
    </div>
  );
};

export default CompanyList;
