import React, { useRef, useState } from 'react';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  callCreatePermission,
  callDeletePermission,
  callFetchPermissions,
  callUpdatePermission,
} from '../../config/api';
import { ALL_PERMISSIONS } from '../../config/constants';
import { Access } from '../../components/share/Access';

const METHOD_COLORS: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PATCH: 'orange',
  DELETE: 'red',
};

const MODULE_OPTIONS = [
  { value: 'USERS', label: 'USERS' },
  { value: 'ROLES', label: 'ROLES' },
  { value: 'PERMISSIONS', label: 'PERMISSIONS' },
  { value: 'COMPANIES', label: 'COMPANIES' },
  { value: 'JOBS', label: 'JOBS' },
  { value: 'RESUMES', label: 'RESUMES' },
];

export const PermissionPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IPermission | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await callDeletePermission(id);
      message.success('Xóa quyền hạn thành công');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Xóa quyền hạn thất bại');
    }
  };

  const columns: ProColumns<IPermission>[] = [
    {
      title: 'Tên quyền hạn',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: 'API Path',
      dataIndex: 'apiPath',
      copyable: true,
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      valueType: 'select',
      valueEnum: {
        GET: { text: 'GET' },
        POST: { text: 'POST' },
        PATCH: { text: 'PATCH' },
        DELETE: { text: 'DELETE' },
      },
      render: (_, record) => (
        <Tag color={METHOD_COLORS[record.method] || 'default'}>
          {record.method}
        </Tag>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      valueType: 'select',
      fieldProps: {
        options: MODULE_OPTIONS,
      },
      render: (_, record) => <Tag color="geekblue">{record.module}</Tag>,
    },
    {
      title: 'Ngày tạo',
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
          <Access permission={ALL_PERMISSIONS.PERMISSIONS.UPDATE} hideChildren>
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => {
                setCurrentRecord(record);
                setModalOpen(true);
              }}
            >
              Sửa
            </Button>
          </Access>

          <Access permission={ALL_PERMISSIONS.PERMISSIONS.DELETE} hideChildren>
            <Popconfirm
              title="Xóa quyền hạn này?"
              description="Bạn có chắc chắn muốn xóa quyền hạn này không?"
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
    <Access permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}>
      <ProTable<IPermission>
        headerTitle="Danh sách quyền hạn (Permissions)"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Access
            key="create"
            permission={ALL_PERMISSIONS.PERMISSIONS.CREATE}
            hideChildren
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentRecord(null);
                setModalOpen(true);
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
          if (params.apiPath) query.apiPath = params.apiPath;
          if (params.method) query.method = params.method;
          if (params.module) query.module = params.module;

          const res = await callFetchPermissions(query);
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

      <ModalForm
        title={currentRecord ? 'Cập nhật quyền hạn' : 'Tạo mới quyền hạn'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRecord || { method: 'GET', module: 'USERS' }}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
        }}
        onFinish={async (values) => {
          try {
            if (currentRecord) {
              await callUpdatePermission(currentRecord._id, values);
              message.success('Cập nhật quyền hạn thành công');
            } else {
              await callCreatePermission(values);
              message.success('Tạo mới quyền hạn thành công');
            }
            setModalOpen(false);
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
          label="Tên quyền hạn"
          placeholder="Nhập tên quyền hạn (ví dụ: Tạo mới người dùng)"
          rules={[{ required: true, message: 'Vui lòng nhập tên quyền hạn' }]}
        />
        <ProFormText
          name="apiPath"
          label="API Path"
          placeholder="Nhập API Path (ví dụ: /api/v1/users)"
          rules={[
            { required: true, message: 'Vui lòng nhập API Path' },
            {
              pattern: /^\/api\/v1\//,
              message: 'API Path phải bắt đầu bằng /api/v1/',
            },
          ]}
        />
        <ProFormSelect
          name="method"
          label="Phương thức (Method)"
          options={[
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PATCH', label: 'PATCH' },
            { value: 'DELETE', label: 'DELETE' },
          ]}
          rules={[{ required: true, message: 'Vui lòng chọn method' }]}
        />
        <ProFormSelect
          name="module"
          label="Thuộc Module"
          options={MODULE_OPTIONS}
          rules={[{ required: true, message: 'Vui lòng chọn module' }]}
        />
      </ModalForm>
    </Access>
  );
};
export default PermissionPage;
