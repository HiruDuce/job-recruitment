import React, { useRef, useState } from 'react';
import {
  ActionType,
  DrawerForm,
  ProColumns,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import dayjs from 'dayjs';
import {
  callCreateJob,
  callDeleteJob,
  callFetchCompanies,
  callFetchJobsManage,
  callUpdateJob,
} from '../../config/api';
import { ALL_PERMISSIONS, LEVELS, LOCATIONS, SKILLS } from '../../config/constants';
import { Access } from '../../components/share/Access';
import { useAppSelector } from '../../redux/hooks';

export const JobPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IJob | null>(null);
  const [description, setDescription] = useState<string>('');

  const { user } = useAppSelector((state) => state.account);
  const isHR = user?.role?.name === 'HR';

  const handleDelete = async (id: string) => {
    try {
      await callDeleteJob(id);
      message.success('Xóa việc làm thành công');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Xóa việc làm thất bại');
    }
  };

  const columns: ProColumns<IJob>[] = [
    {
      title: 'Tên việc làm',
      dataIndex: 'name',
      copyable: true,
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
      title: 'Kỹ năng',
      dataIndex: 'skills',
      hideInSearch: true,
      render: (_, record) => (
        <Space wrap>
          {record.skills?.map((skill) => (
            <Tag key={skill} color="blue">
              {skill}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      valueType: 'select',
      valueEnum: LOCATIONS.reduce((acc, cur) => {
        acc[cur.value] = { text: cur.label };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (_, record) => {
        const loc = LOCATIONS.find((l) => l.value === record.location);
        return loc ? loc.label : record.location;
      },
    },
    {
      title: 'Cấp bậc',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: LEVELS.reduce((acc, cur) => {
        acc[cur.value] = { text: cur.label };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (_, record) => {
        const lvl = LEVELS.find((l) => l.value === record.level);
        return lvl ? lvl.label : record.level;
      },
    },
    {
      title: 'Mức lương',
      dataIndex: 'salary',
      hideInSearch: true,
      render: (_, record) =>
        typeof record.salary === 'number'
          ? `${record.salary.toLocaleString('vi-VN')} đ`
          : '-',
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'endDate',
      valueType: 'date',
      hideInSearch: true,
      render: (_, record) =>
        record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      valueType: 'select',
      valueEnum: {
        true: { text: 'ĐANG TUYỂN', status: 'Success' },
        false: { text: 'TẠM DỪNG', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'ĐANG TUYỂN' : 'TẠM DỪNG'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => {
                setCurrentRecord(record);
                setDescription(record.description || '');
                setDrawerOpen(true);
              }}
            >
              Sửa
            </Button>
          </Access>

          <Access permission={ALL_PERMISSIONS.JOBS.DELETE} hideChildren>
            <Popconfirm
              title="Xóa việc làm này?"
              description="Bạn có chắc chắn muốn xóa bài đăng tuyển dụng này không?"
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
    <Access permission={ALL_PERMISSIONS.JOBS.GET_MANAGE}>
      <ProTable<IJob>
        headerTitle="Danh sách việc làm (Jobs)"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Access
            key="create"
            permission={ALL_PERMISSIONS.JOBS.CREATE}
            hideChildren
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentRecord(null);
                setDescription('');
                setDrawerOpen(true);
              }}
            >
              Thêm mới
            </Button>
          </Access>,
        ]}
        request={async (params) => {
          const query: any = {
            current: params.current,
            pageSize: params.pageSize,
          };
          if (params.name) query.name = params.name;
          if (params.location) query.location = params.location;
          if (params.level) query.level = params.level;
          if (params.isActive !== undefined) query.isActive = params.isActive;

          const res = await callFetchJobsManage(query);
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

      <DrawerForm
        title={currentRecord ? 'Cập nhật việc làm' : 'Tạo mới việc làm'}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setCurrentRecord(null);
            setDescription('');
          }
        }}
        initialValues={
          currentRecord
            ? {
                ...currentRecord,
                company: (currentRecord.company as any)?._id || currentRecord.company,
                dateRange:
                  currentRecord.startDate && currentRecord.endDate
                    ? [dayjs(currentRecord.startDate), dayjs(currentRecord.endDate)]
                    : undefined,
              }
            : {
                isActive: true,
                quantity: 1,
                dateRange: [dayjs(), dayjs().add(30, 'day')],
              }
        }
        drawerProps={{
          destroyOnClose: true,
          maskClosable: false,
          width: 750,
        }}
        onFinish={async (values) => {
          if (!description || description === '<p><br></p>') {
            message.error('Vui lòng nhập mô tả công việc');
            return false;
          }

          const [start, end] = values.dateRange;

          const payload: any = {
            name: values.name,
            skills: values.skills,
            location: values.location,
            salary: values.salary,
            quantity: values.quantity,
            level: values.level,
            startDate: dayjs(start).toISOString(),
            endDate: dayjs(end).toISOString(),
            isActive: values.isActive ?? true,
            description: description,
          };

          if (!isHR) {
            payload.company = values.company;
          }

          try {
            if (currentRecord) {
              await callUpdateJob(currentRecord._id, payload);
              message.success('Cập nhật việc làm thành công');
            } else {
              await callCreateJob(payload);
              message.success('Tạo mới việc làm thành công');
            }
            setDrawerOpen(false);
            actionRef.current?.reload();
            return true;
          } catch (error: any) {
            message.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại');
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="Tên việc làm"
          placeholder="Nhập tên việc làm tuyển dụng (vd: Senior NodeJS Developer)"
          rules={[{ required: true, message: 'Vui lòng nhập tên việc làm' }]}
        />

        <ProFormSelect
          name="skills"
          label="Kỹ năng yêu cầu"
          mode="tags"
          placeholder="Chọn hoặc nhập thêm kỹ năng"
          options={SKILLS.map((s) => ({ label: s, value: s }))}
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 kỹ năng' }]}
        />

        {!isHR && (
          <ProFormSelect
            name="company"
            label="Công ty"
            placeholder="Chọn công ty"
            rules={[{ required: true, message: 'Vui lòng chọn công ty' }]}
            request={async () => {
              const res = await callFetchCompanies({ pageSize: 100 });
              return (
                res.data?.result.map((c) => ({
                  label: c.name,
                  value: c._id,
                })) || []
              );
            }}
          />
        )}

        <ProFormSelect
          name="location"
          label="Địa điểm làm việc"
          placeholder="Chọn địa điểm"
          options={LOCATIONS}
          rules={[{ required: true, message: 'Vui lòng chọn địa điểm làm việc' }]}
        />

        <ProFormSelect
          name="level"
          label="Cấp bậc"
          placeholder="Chọn cấp bậc"
          options={LEVELS}
          rules={[{ required: true, message: 'Vui lòng chọn cấp bậc' }]}
        />

        <ProFormDigit
          name="salary"
          label="Mức lương (VNĐ)"
          placeholder="Nhập mức lương (vd: 20000000)"
          min={0}
          rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}
        />

        <ProFormDigit
          name="quantity"
          label="Số lượng tuyển"
          placeholder="Nhập số lượng tuyển dụng"
          min={1}
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        />

        <ProFormDateRangePicker
          name="dateRange"
          label="Thời gian tuyển dụng"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian tuyển dụng' }]}
        />

        <ProFormSwitch
          name="isActive"
          label="Trạng thái tuyển dụng"
        />

        <Form.Item
          label="Mô tả công việc"
          required
        >
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder="Nhập mô tả chi tiết công việc, quyền lợi và yêu cầu tuyển dụng..."
            style={{ minHeight: 200 }}
          />
        </Form.Item>
      </DrawerForm>
    </Access>
  );
};

export default JobPage;
