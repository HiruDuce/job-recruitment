import React, { useEffect, useRef, useState } from 'react';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Checkbox,
  Collapse,
  Form,
  message,
  Popconfirm,
  Space,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  callCreateRole,
  callDeleteRole,
  callFetchPermissions,
  callFetchRoles,
  callUpdateRole,
} from '../../config/api';
import { ALL_PERMISSIONS } from '../../config/constants';
import { Access } from '../../components/share/Access';

export const RolePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IRole | null>(null);
  const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await callFetchPermissions({ pageSize: 100 });
        if (res.data?.result) {
          setAllPermissions(res.data.result);
        }
      } catch {
        // Ignored
      }
    };
    fetchPerms();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await callDeleteRole(id);
      message.success('Xóa vai trò thành công');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Xóa vai trò thất bại');
    }
  };

  // Nhóm permissions theo module cho Collapse
  const permissionsByModule = React.useMemo(() => {
    const groups: Record<string, IPermission[]> = {};
    allPermissions.forEach((p) => {
      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    });
    return groups;
  }, [allPermissions]);

  const columns: ProColumns<IRole>[] = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'ĐANG HOẠT ĐỘNG' : 'TẠM KHÓA'}
        </Tag>
      ),
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
          <Access permission={ALL_PERMISSIONS.ROLES.UPDATE} hideChildren>
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

          {record.name !== 'ADMIN' && (
            <Access permission={ALL_PERMISSIONS.ROLES.DELETE} hideChildren>
              <Popconfirm
                title="Xóa vai trò này?"
                description="Bạn có chắc chắn muốn xóa vai trò này không?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Access>
          )}
        </Space>
      ),
    },
  ];

  const collapseItems = Object.entries(permissionsByModule).map(
    ([moduleName, perms]) => ({
      key: moduleName,
      forceRender: true,
      label: <span style={{ fontWeight: 600 }}>{moduleName}</span>,
      children: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {perms.map((p) => (
            <Checkbox key={p._id} value={p._id}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>{' '}
              <Tag color="blue" style={{ fontSize: 11 }}>
                {p.method}
              </Tag>{' '}
              <span style={{ color: '#888', fontSize: 12 }}>{p.apiPath}</span>
            </Checkbox>
          ))}
        </div>
      ),
    }),
  );

  return (
    <Access permission={ALL_PERMISSIONS.ROLES.GET_PAGINATE}>
      <ProTable<IRole>
        headerTitle="Danh sách vai trò (Roles)"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Access
            key="create"
            permission={ALL_PERMISSIONS.ROLES.CREATE}
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

          const res = await callFetchRoles(query);
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
        title={currentRecord ? 'Cập nhật vai trò' : 'Tạo mới vai trò'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setCurrentRecord(null);
          }
        }}
        initialValues={
          currentRecord
            ? {
                ...currentRecord,
                permissions: Array.isArray(currentRecord.permissions)
                  ? currentRecord.permissions.map((p: any) => p?._id || p)
                  : [],
              }
            : { isActive: true, permissions: [] }
        }
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          width: 800,
        }}
        onFinish={async (values) => {
          try {
            if (currentRecord) {
              await callUpdateRole(currentRecord._id, values);
              message.success('Cập nhật vai trò thành công');
            } else {
              await callCreateRole(values);
              message.success('Tạo mới vai trò thành công');
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
          label="Tên vai trò"
          placeholder="Nhập tên vai trò (ví dụ: HR, TESTER)"
          rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
        />
        <ProFormText
          name="description"
          label="Mô tả"
          placeholder="Nhập mô tả vai trò"
        />
        <ProFormSwitch
          name="isActive"
          label="Trạng thái hoạt động"
          initialValue={true}
        />

        <Form.Item
          name="permissions"
          label="Phân quyền chức năng"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 permission' }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Collapse items={collapseItems} defaultActiveKey={['USERS', 'ROLES', 'JOBS']} />
          </Checkbox.Group>
        </Form.Item>
      </ModalForm>
    </Access>
  );
};
export default RolePage;
