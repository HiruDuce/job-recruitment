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
  DollarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
  InboxOutlined,
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
  const [uploading, setUploading] = useState<boolean>(false);
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
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>Không tìm thấy thông tin việc làm này</Title>
        <Link to="/job">
          <Button type="primary">Quay lại danh sách việc làm</Button>
        </Link>
      </div>
    );
  }

  const company = job.company as any;
  const locationLabel =
    LOCATIONS.find((l) => l.value === job.location)?.label || job.location;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/job">Việc làm IT</Link> },
          { title: job.name },
        ]}
      />

      {/* Header Card */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            <Avatar
              src={company?.logo}
              shape="square"
              size={96}
              style={{ objectFit: 'contain' }}
            >
              {(company?.name || job.name).charAt(0).toUpperCase()}
            </Avatar>
          </Col>

          <Col xs={24} sm={18} md={14}>
            <Title level={3} style={{ margin: 0 }}>
              {job.name}
            </Title>
            <div style={{ marginTop: 8 }}>
              {company?._id ? (
                <Link to={`/company/${company._id}`}>
                  <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                    {company.name}
                  </Text>
                </Link>
              ) : (
                <Text strong style={{ fontSize: 16 }}>
                  {company?.name || 'Doanh nghiệp IT'}
                </Text>
              )}
            </div>

            <Space wrap size={[16, 8]} style={{ marginTop: 12 }}>
              <Space>
                <DollarOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#d4380d', fontSize: 15 }}>
                  {typeof job.salary === 'number'
                    ? `${job.salary.toLocaleString('vi-VN')} đ`
                    : 'Thỏa thuận'}
                </Text>
              </Space>

              <Space>
                <EnvironmentOutlined style={{ color: '#888' }} />
                <Text>{locationLabel}</Text>
              </Space>

              <Space>
                <CalendarOutlined style={{ color: '#888' }} />
                <Text type="secondary">
                  Hạn nộp: {job.endDate ? dayjs(job.endDate).format('DD/MM/YYYY') : '-'}
                </Text>
              </Space>
            </Space>
          </Col>

          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleApplyClick}
              style={{ height: 48, fontSize: 16, fontWeight: 600 }}
            >
              Ứng tuyển ngay
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content Layout */}
      <Row gutter={[24, 24]}>
        {/* Left: Job Description */}
        <Col xs={24} lg={16}>
          <Card title="Mô tả công việc" style={{ borderRadius: 12 }}>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(job.description || ''),
              }}
              style={{ lineHeight: 1.8, fontSize: 15 }}
            />
          </Card>
        </Col>

        {/* Right: Job details sidebar */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* General info */}
            <Card title="Thông tin tuyển dụng" size="small" style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Cấp bậc
                  </Text>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>{job.level}</div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Số lượng tuyển
                  </Text>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>
                    <UsergroupAddOutlined style={{ marginRight: 6 }} />
                    {job.quantity} người
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Địa điểm làm việc
                  </Text>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>{locationLabel}</div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Kỹ năng yêu cầu
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    <Space wrap size={[6, 6]}>
                      {job.skills?.map((s) => (
                        <Tag key={s} color="blue">
                          {s}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </div>
            </Card>

            {/* Company info preview */}
            {company && (
              <Card title="Về công ty" size="small" style={{ borderRadius: 12 }}>
                <Title level={5} style={{ margin: 0 }}>
                  {company.name}
                </Title>
                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ marginTop: 8, fontSize: 13 }}
                >
                  {company.address}
                </Paragraph>
                {company._id && (
                  <Link to={`/company/${company._id}`}>
                    <Button type="link" style={{ padding: 0 }}>
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
        title={`Ứng tuyển vị trí: ${job.name}`}
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
      >
        <div style={{ padding: '16px 0' }}>
          <Paragraph type="secondary">
            Vui lòng tải lên hồ sơ CV của bạn định dạng <strong>PDF</strong> (tối đa 5MB) để gửi đến nhà tuyển dụng.
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
              return false; // Chặn tự động upload của antd để xử lý thủ công khi bấm Ok
            }}
            onRemove={() => setPdfFile(null)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#1677ff', fontSize: 44 }} />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả file CV (PDF) vào đây</p>
            <p className="ant-upload-hint">Chỉ hỗ trợ file PDF duy nhất có dung lượng dưới 5MB</p>
          </Dragger>

          {pdfFile && (
            <div style={{ marginTop: 12, color: '#52c41a', fontSize: 13 }}>
              ✓ Đã chọn file: <strong>{pdfFile.name}</strong> (
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
