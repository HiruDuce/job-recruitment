import React, { useRef, useState } from 'react';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  callCreateUser,
  callDeleteUser,
  callFetchCompanies,
  callFetchRoles,
  callFetchUsers,
  callUpdateUser,
} from '../../config/api';
import { ALL_PERMISSIONS } from '../../config/constants';
import { Access } from '../../components/share/Access';

export const UserPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IUser | null>(null);
  const [rolesList, setRolesList] = useState<IRole[]>([]);

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await callFetchRoles({ pageSize: 100 });
        if (res.data?.result) {
          setRolesList(res.data.result);
        }
      } catch {
        // Ignored
      }
    };
    fetchRoles();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await callDeleteUser(id);
      message.success('Xóa người dùng thành công');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Xóa người dùng thất bại');
    }
  };

  const columns: ProColumns<IUser>[] = [
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'name'],
      hideInSearch: true,
      render: (_, record) => {
        const roleName = (record.role as any)?.name || record.role;
        let color = 'default';
        if (roleName === 'ADMIN') color = 'gold';
        else if (roleName === 'HR') color = 'green';
        else if (roleName === 'NORMAL_USER') color = 'blue';

        return <Tag color={color}>{roleName || '-'}</Tag>;
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
      render: (_, record) => {
        const roleName = (record.role as any)?.name;
        const isAdminUser = roleName === 'ADMIN';

        return (
          <Space>
            <Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
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

            {!isAdminUser && (
              <Access permission={ALL_PERMISSIONS.USERS.DELETE} hideChildren>
                <Popconfirm
                  title="Xóa người dùng này?"
                  description="Bạn có chắc chắn muốn xóa người dùng này không?"
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
        );
      },
    },
  ];

  return (
    <Access permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}>
      <ProTable<IUser>
        headerTitle="Danh sách người dùng (Users)"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Access
            key="create"
            permission={ALL_PERMISSIONS.USERS.CREATE}
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
          if (params.email) query.email = params.email;

          const res = await callFetchUsers(query);
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
        title={currentRecord ? 'Cập nhật người dùng' : 'Tạo mới người dùng'}
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
                name: currentRecord.name,
                email: currentRecord.email,
                role: (currentRecord.role as any)?._id || currentRecord.role,
                company: (currentRecord.company as any)?._id || currentRecord.company,
              }
            : {}
        }
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          width: 600,
        }}
        onFinish={async (values) => {
          try {
            if (currentRecord) {
              const updateData: any = {
                name: values.name,
                email: values.email,
                role: values.role,
                company: values.company || null,
              };
              await callUpdateUser(currentRecord._id, updateData);
              message.success('Cập nhật người dùng thành công');
            } else {
              await callCreateUser(values);
              message.success('Tạo mới người dùng thành công');
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
          label="Tên hiển thị"
          placeholder="Nhập tên người dùng"
          rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
        />
        <ProFormText
          name="email"
          label="Email"
          placeholder="Nhập địa chỉ email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
          disabled={!!currentRecord}
        />
        {!currentRecord && (
          <ProFormText.Password
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          />
        )}
        <ProFormSelect
          name="role"
          label="Vai trò"
          placeholder="Chọn vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          request={async () => {
            const res = await callFetchRoles({ pageSize: 100 });
            if (res.data?.result) {
              setRolesList(res.data.result);
            }
            return (
              res.data?.result.map((r) => ({
                label: r.name,
                value: r._id,
              })) || []
            );
          }}
        />

        <ProFormDependency name={['role']}>
          {({ role }) => {
            const selectedRole = rolesList.find((r) => r._id === role);
            const isHR = selectedRole?.name === 'HR';

            if (!isHR) return null;

            return (
              <ProFormSelect
                name="company"
                label="Công ty"
                placeholder="Chọn công ty thuộc quyền quản lý"
                rules={[{ required: true, message: 'Vui lòng chọn công ty cho tài khoản HR' }]}
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
            );
          }}
        </ProFormDependency>
      </ModalForm>
    </Access>
  );
};

export default UserPage;
