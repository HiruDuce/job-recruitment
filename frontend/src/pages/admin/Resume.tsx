import React, { useRef, useState } from 'react';
import {
  ActionType,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
  Timeline,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  callDeleteResume,
  callFetchResumes,
  callUpdateResumeStatus,
} from '../../config/api';
import { ALL_PERMISSIONS, RESUME_STATUS } from '../../config/constants';
import { Access } from '../../components/share/Access';

export const ResumePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IResume | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const handleDelete = async (id: string) => {
    try {
      await callDeleteResume(id);
      message.success('Xóa hồ sơ ứng tuyển thành công');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Xóa hồ sơ thất bại');
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentRecord || !newStatus) return;
    setUpdating(true);
    try {
      const res = await callUpdateResumeStatus(currentRecord._id, newStatus);
      message.success('Cập nhật trạng thái hồ sơ thành công');
      if (res.data) {
        setCurrentRecord(res.data);
      }
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusTag = (status: string) => {
    const config = RESUME_STATUS.find((s) => s.value === status);
    return <Tag color={config?.color || 'default'}>{config?.label || status}</Tag>;
  };

  const columns: ProColumns<IResume>[] = [
    {
      title: 'Email ứng viên',
      dataIndex: 'email',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: 'Công việc ứng tuyển',
      dataIndex: ['job', 'name'],
      hideInSearch: true,
      render: (_, record) => {
        const jobName = (record.job as any)?.name;
        return jobName ? <span style={{ fontWeight: 500 }}>{jobName}</span> : '-';
      },
    },
    {
      title: 'Công ty',
      dataIndex: ['company', 'name'],
      hideInSearch: true,
      render: (_, record) => {
        const companyName = (record.company as any)?.name;
        return companyName ? <Tag color="cyan">{companyName}</Tag> : '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: RESUME_STATUS.reduce((acc, cur) => {
        acc[cur.value] = { text: cur.label };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) =>
        record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Hành động',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#1677ff' }} />}
            onClick={() => {
              setCurrentRecord(record);
              setNewStatus(record.status);
              setDrawerOpen(true);
            }}
          >
            Xem
          </Button>

          <Access permission={ALL_PERMISSIONS.RESUMES.DELETE} hideChildren>
            <Popconfirm
              title="Xóa hồ sơ này?"
              description="Bạn có chắc chắn muốn xóa hồ sơ ứng tuyển này không?"
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
      <ProTable<IResume>
        headerTitle="Danh sách CV ứng tuyển (Resumes)"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        request={async (params) => {
          const query: any = {
            current: params.current,
            pageSize: params.pageSize,
          };
          if (params.status) query.status = params.status;

          const res = await callFetchResumes(query);
          return {
            data: res.data?.result || [],
            total: res.data?.meta?.total || 0,
            success: true,
          };
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Drawer
        title="Chi tiết hồ sơ ứng tuyển"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setCurrentRecord(null);
        }}
        width={650}
        destroyOnClose
      >
        {currentRecord && (
          <div>
            <Descriptions title="Thông tin chung" bordered column={1} size="small">
              <Descriptions.Item label="Email ứng viên">
                {currentRecord.email}
              </Descriptions.Item>
              <Descriptions.Item label="Công việc">
                {(currentRecord.job as any)?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Công ty">
                {(currentRecord.company as any)?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                {getStatusTag(currentRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="File CV">
                <a
                  href={currentRecord.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}
                >
                  <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                  Mở xem file CV (PDF)
                </a>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <h4>Thay đổi trạng thái hồ sơ</h4>
              <Access permission={ALL_PERMISSIONS.RESUMES.UPDATE} hideChildren>
                <Space style={{ marginTop: 12 }}>
                  <Select
                    style={{ width: 200 }}
                    value={newStatus}
                    onChange={(val) => setNewStatus(val)}
                    options={RESUME_STATUS.map((s) => ({
                      label: s.label,
                      value: s.value,
                    }))}
                  />
                  <Button
                    type="primary"
                    onClick={handleUpdateStatus}
                    loading={updating}
                    disabled={newStatus === currentRecord.status}
                  >
                    Lưu trạng thái
                  </Button>
                </Space>
              </Access>
            </div>

            <Divider />

            <div>
              <h4>Lịch sử xử lý hồ sơ</h4>
              <div style={{ marginTop: 16 }}>
                {currentRecord.history && currentRecord.history.length > 0 ? (
                  <Timeline
                    items={currentRecord.history.map((h) => ({
                      color:
                        h.status === 'APPROVED'
                          ? 'green'
                          : h.status === 'REJECTED'
                          ? 'red'
                          : h.status === 'REVIEWING'
                          ? 'blue'
                          : 'gray',
                      children: (
                        <div>
                          <div>
                            {getStatusTag(h.status)}{' '}
                            <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>
                              {h.updatedAt
                                ? dayjs(h.updatedAt).format('DD/MM/YYYY HH:mm:ss')
                                : ''}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                            Người xử lý: {h.updatedBy?.email || 'Hệ thống'}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <p style={{ color: '#888' }}>Chưa có lịch sử thay đổi</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </Access>
  );
};

export default ResumePage;
