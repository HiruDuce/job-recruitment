import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd';
import {
  DollarCircleFilled,
  EnvironmentOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  SafetyCertificateFilled,
  InboxOutlined,
  SendOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  BankOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import {
  callCreateResume,
  callFetchJobById,
  callUploadFile,
} from '../../config/api';
import { LOCATIONS } from '../../config/constants';
import { useAppSelector } from '../../redux/hooks';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.account);

  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await callFetchJobById(id);
        if (res.data) {
          setJob(res.data);
        }
      } catch (error: any) {
        message.error(error?.message || 'Không thể tải thông tin việc làm');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?callback=/job/${id}`);
      return;
    }
    setPdfFile(null);
    setModalOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!pdfFile) {
      message.error('Vui lòng chọn file CV (PDF) để ứng tuyển');
      return;
    }
    if (!id) return;

    setSubmitting(true);
    try {
      // 1. Upload CV file to get url
      const uploadRes = await callUploadFile(pdfFile, 'resume');
      const cvUrl = uploadRes.data?.url;
      if (!cvUrl) {
        throw new Error('Upload CV thất bại');
      }

      // 2. Submit application
      await callCreateResume({
        url: cvUrl,
        job: id,
      });

      message.success('Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ.');
      setModalOpen(false);
      setPdfFile(null);
    } catch (error: any) {
      message.error(error?.message || 'Ứng tuyển thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
        }}
      >
        <Title level={4}>Không tìm thấy thông tin việc làm này</Title>
        <Paragraph type="secondary">
          Việc làm có thể đã hết hạn hoặc tạm ngừng nhận hồ sơ.
        </Paragraph>
        <Link to="/job">
          <Button type="primary" size="large" style={{ marginTop: 12 }}>
            Quay lại danh sách việc làm
          </Button>
        </Link>
      </div>
    );
  }

  const company = job.company as any;
  const locationLabel =
    LOCATIONS.find((l) => l.value === job.location)?.label || job.location;

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 48 }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/job">Việc làm IT</Link> },
          { title: job.name },
        ]}
      />

      {/* Header Card Hero */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '28px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.08)',
          marginBottom: 24,
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          {/* Logo công ty */}
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 88,
                height: 88,
                margin: '0 auto',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                overflow: 'hidden',
              }}
            >
              <Avatar
                src={company?.logo}
                shape="square"
                size={80}
                style={{ objectFit: 'contain' }}
              >
                {(company?.name || job.name).charAt(0).toUpperCase()}
              </Avatar>
            </div>
          </Col>

          {/* Chi tiết tiêu đề & metadata */}
          <Col xs={24} sm={18} md={14}>
            <Title
              level={2}
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.35,
                letterSpacing: '-0.3px',
              }}
            >
              {job.name}
            </Title>

            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {company?._id ? (
                <Link to={`/company/${company._id}`}>
                  <Text strong style={{ fontSize: 15, color: '#0052cc' }}>
                    {company.name}
                  </Text>
                </Link>
              ) : (
                <Text strong style={{ fontSize: 15, color: '#334155' }}>
                  {company?.name || 'Doanh nghiệp IT'}
                </Text>
              )}
              <SafetyCertificateFilled style={{ color: '#0052cc', fontSize: 14 }} />
            </div>

            {/* Badges Lương, Địa điểm, Hạn nộp */}
            <Space wrap size={[10, 10]} style={{ marginTop: 14 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '4px 12px',
                  borderRadius: 8,
                }}
              >
                <DollarCircleFilled style={{ color: '#059669', fontSize: 16 }} />
                <span style={{ color: '#047857', fontWeight: 700, fontSize: 14.5 }}>
                  {typeof job.salary === 'number'
                    ? `${job.salary.toLocaleString('vi-VN')} đ`
                    : 'Thỏa thuận'}
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                <EnvironmentOutlined style={{ color: '#64748b' }} />
                <span>{locationLabel}</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#c2410c',
                  fontWeight: 500,
                }}
              >
                <CalendarOutlined style={{ color: '#ea580c' }} />
                <span>Hạn nộp: {job.endDate ? dayjs(job.endDate).format('DD/MM/YYYY') : 'Đang mở'}</span>
              </div>
            </Space>
          </Col>

          {/* Nút Ứng tuyển ngay */}
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              block
              onClick={handleApplyClick}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0052cc 0%, #0065ff 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0, 82, 204, 0.35)',
              }}
            >
              Ứng tuyển ngay
            </Button>
          </Col>
        </Row>
      </div>

      {/* Main Content Layout 2 Cột */}
      <Row gutter={[24, 24]}>
        {/* Cột Trái: Mô tả công việc chi tiết */}
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700 }}>
                  <span>Chi tiết tin tuyển dụng</span>
                </div>
              }
              style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
              styles={{ body: { padding: '24px 28px' } }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(job.description || ''),
                }}
                style={{
                  lineHeight: 1.85,
                  fontSize: 15,
                  color: '#1e293b',
                  wordBreak: 'break-word',
                }}
              />

              <div
                style={{
                  marginTop: 32,
                  padding: '20px',
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                    Bảo vệ quyền lợi ứng viên cùng ITJobs
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    Tin tuyển dụng đã được xác minh tính xác thực và chất lượng.
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={handleApplyClick}
                  style={{
                    background: 'linear-gradient(135deg, #0052cc 0%, #0065ff 100%)',
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  Nộp hồ sơ ngay
                </Button>
              </div>
            </Card>
          </div>
        </Col>

        {/* Cột Phải: Sidebar Thông tin tuyển dụng & Công ty */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Box Thông tin tuyển dụng */}
            <Card
              title={
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Thông tin chung
                </span>
              }
              style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Cấp bậc tuyển dụng
                  </Text>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 3 }}>
                    {job.level}
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Số lượng cần tuyển
                  </Text>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UsergroupAddOutlined style={{ color: '#0052cc' }} />
                    <span>{job.quantity} người</span>
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Địa điểm làm việc
                  </Text>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 3 }}>
                    {locationLabel}
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Kỹ năng yêu cầu
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Space wrap size={[6, 6]}>
                      {job.skills?.map((s) => (
                        <Tag
                          key={s}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            color: '#1d4ed8',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {s}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </div>
            </Card>

            {/* Box Thông tin công ty */}
            {company && (
              <Card
                title={
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Về công ty
                  </span>
                }
                style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar
                    src={company.logo}
                    shape="square"
                    size={48}
                    style={{ border: '1px solid #e2e8f0', objectFit: 'contain' }}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                      {company.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <BankOutlined style={{ marginRight: 4 }} /> Doanh nghiệp công nghệ
                    </Text>
                  </div>
                </div>

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}
                >
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {company.address}
                </Paragraph>

                {company._id && (
                  <Link to={`/company/${company._id}`}>
                    <Button
                      type="link"
                      style={{ padding: 0, fontWeight: 600, color: '#0052cc' }}
                    >
                      Xem trang công ty →
                    </Button>
                  </Link>
                )}
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {/* Apply Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilePdfOutlined style={{ color: '#0052cc', fontSize: 20 }} />
            <span>Ứng tuyển vị trí: {job.name}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          if (!submitting) {
            setModalOpen(false);
            setPdfFile(null);
          }
        }}
        confirmLoading={submitting}
        okText="Nộp hồ sơ ứng tuyển"
        cancelText="Hủy"
        onOk={handleConfirmApply}
        destroyOnClose
        width={560}
      >
        <div style={{ padding: '16px 0' }}>
          <Paragraph type="secondary" style={{ fontSize: 13.5, marginBottom: 16 }}>
            Vui lòng tải lên file hồ sơ CV của bạn định dạng <strong>PDF</strong> (tối đa 5MB).
            Nhà tuyển dụng sẽ nhận được hồ sơ ngay sau khi bạn xác nhận.
          </Paragraph>

          <Dragger
            accept=".pdf,application/pdf"
            maxCount={1}
            beforeUpload={(file) => {
              const isPdf =
                file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
              if (!isPdf) {
                message.error('Chỉ chấp nhận file định dạng PDF!');
                return Upload.LIST_IGNORE;
              }

              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error('File CV không được vượt quá 5MB!');
                return Upload.LIST_IGNORE;
              }

              setPdfFile(file);
              return false;
            }}
            onRemove={() => setPdfFile(null)}
            style={{
              padding: '24px 16px',
              background: '#f8fafc',
              borderColor: '#cbd5e1',
              borderRadius: 12,
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#0052cc', fontSize: 44 }} />
            </p>
            <p className="ant-upload-text" style={{ fontWeight: 600, color: '#0f172a' }}>
              Nhấp hoặc kéo thả file CV (PDF) vào đây
            </p>
            <p className="ant-upload-hint" style={{ fontSize: 12.5, color: '#64748b' }}>
              Chỉ hỗ trợ file PDF duy nhất có dung lượng dưới 5MB
            </p>
          </Dragger>

          {pdfFile && (
            <div
              style={{
                marginTop: 14,
                color: '#059669',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircleFilled />
              <span>
                Đã chọn file: <strong>{pdfFile.name}</strong> (
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
