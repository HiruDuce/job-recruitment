import React, { useRef, useState } from 'react';
import {
  ActionType,
  DrawerForm,
  ProColumns,
  ProForm,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Form,
  message,
  Popconfirm,
  Space,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import dayjs from 'dayjs';
import {
  callCreateCompany,
  callDeleteCompany,
  callFetchCompanies,
  callUpdateCompany,
  callUploadFile,
} from '../../config/api';
import { ALL_PERMISSIONS } from '../../config/constants';
import { Access } from '../../components/share/Access';

export const CompanyPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ICompany | null>(null);

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [description, setDescription] = useState<string>('');

  const handleDelete = async (id: string) => {
    try {
      await callDeleteCompany(id);
      message.success('Xóa công ty thành công');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Xóa công ty thất bại');
    }
  };

  const handleCustomUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await callUploadFile(file as File, 'company');
      if (res.data?.url) {
        setLogoUrl(res.data.url);
        setFileList([
          {
            uid: '-1',
            name: (file as File).name,
            status: 'done',
            url: res.data.url,
          },
        ]);
        message.success('Tải ảnh logo lên thành công');
        onSuccess?.(res.data);
      } else {
        throw new Error('Upload không thành công');
      }
    } catch (err: any) {
      message.error(err?.message || 'Tải ảnh logo thất bại');
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const columns: ProColumns<ICompany>[] = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      hideInSearch: true,
      render: (_, record) => (
        <Avatar
          src={record.logo}
          shape="square"
          size={48}
          alt={record.name}
          style={{ objectFit: 'contain' }}
        >
          {record.name.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Tên công ty',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
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
          <Access permission={ALL_PERMISSIONS.COMPANIES.UPDATE} hideChildren>
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => {
                setCurrentRecord(record);
                setLogoUrl(record.logo || '');
                setFileList(
                  record.logo
                    ? [
                        {
                          uid: '-1',
                          name: 'logo',
                          status: 'done',
                          url: record.logo,
                        },
                      ]
                    : [],
                );
                setDescription(record.description || '');
                setDrawerOpen(true);
              }}
            >
              Sửa
            </Button>
          </Access>

          <Access permission={ALL_PERMISSIONS.COMPANIES.DELETE} hideChildren>
            <Popconfirm
              title="Xóa công ty này?"
              description="Bạn có chắc chắn muốn xóa công ty này không?"
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
    <div>
      <ProTable<ICompany>
        headerTitle="Danh sách công ty (Companies)"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Access
            key="create"
            permission={ALL_PERMISSIONS.COMPANIES.CREATE}
            hideChildren
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentRecord(null);
                setLogoUrl('');
                setFileList([]);
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
          if (params.address) query.address = params.address;

          const res = await callFetchCompanies(query);
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
        title={currentRecord ? 'Cập nhật công ty' : 'Tạo mới công ty'}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setCurrentRecord(null);
            setLogoUrl('');
            setFileList([]);
            setDescription('');
          }
        }}
        initialValues={currentRecord ?? {}}
        drawerProps={{
          destroyOnClose: true,
          maskClosable: false,
          width: 700,
        }}
        onFinish={async (values) => {
          if (!logoUrl) {
            message.error('Vui lòng tải ảnh logo cho công ty');
            return false;
          }
          if (!description || description === '<p><br></p>') {
            message.error('Vui lòng nhập mô tả công ty');
            return false;
          }

          try {
            const payload = {
              name: values.name,
              address: values.address,
              logo: logoUrl,
              description: description,
            };

            if (currentRecord) {
              await callUpdateCompany(currentRecord._id, payload);
              message.success('Cập nhật công ty thành công');
            } else {
              await callCreateCompany(payload);
              message.success('Tạo mới công ty thành công');
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
          label="Tên công ty"
          placeholder="Nhập tên công ty"
          rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
        />

        <ProFormText
          name="address"
          label="Địa chỉ"
          placeholder="Nhập địa chỉ trụ sở / văn phòng"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty' }]}
        />

        <ProForm.Item
          label="Logo công ty"
          required
          tooltip="Chỉ chấp nhận file ảnh (PNG, JPG, WEBP), tối đa 5MB"
        >
          <Upload
            name="file"
            listType="picture-card"
            maxCount={1}
            fileList={fileList}
            customRequest={handleCustomUpload}
            beforeUpload={(file) => {
              const isImage =
                file.type === 'image/jpeg' ||
                file.type === 'image/png' ||
                file.type === 'image/webp';
              if (!isImage) {
                message.error('Chỉ được tải lên file ảnh JPG/PNG/WEBP!');
                return Upload.LIST_IGNORE;
              }
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
                return Upload.LIST_IGNORE;
              }
              return true;
            }}
            onRemove={() => {
              setLogoUrl('');
              setFileList([]);
            }}
          >
            {fileList.length >= 1 ? null : (
              <div>
                {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
        </ProForm.Item>

        <Form.Item
          label="Mô tả công ty"
          required
          rules={[{ required: true, message: 'Vui lòng nhập mô tả công ty' }]}
        >
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder="Nhập nội dung giới thiệu, văn hóa và thông tin chi tiết về công ty..."
            style={{ minHeight: 200 }}
          />
        </Form.Item>
      </DrawerForm>
    </div>
  );
};

export default CompanyPage;
