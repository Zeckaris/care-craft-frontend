import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  GiftOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { Gift } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { DataTable } from '@/components/common/DataTable';
import { useGifts } from '@/hooks/useGifts';
import { formatDateTime } from '@/utils/dateFormat';
import {
  resolveGiftImage,
  validateGiftImage,
} from '@/utils/gift';

const { Text } = Typography;
const { TextArea } = Input;

const activeFilterOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

interface GiftFormValues {
  name: string;
  description?: string;
  isActive: boolean;
}

function createdByName(gift: Gift): string {
  if (!gift.createdBy || typeof gift.createdBy === 'string') return '';
  return (
    [gift.createdBy.firstName, gift.createdBy.lastName]
      .filter(Boolean)
      .join(' ') || gift.createdBy.email || ''
  );
}

export default function GiftsPage() {
  const [searchName, setSearchName] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    undefined,
  );
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    gifts,
    total,
    currentPage,
    pageSize,
    isLoading,
    isError,
    fetchError,
    refetch,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGifts({
    name: searchName,
    isActive:
      activeFilter === undefined ? undefined : activeFilter === 'true',
    pagination,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form] = Form.useForm<GiftFormValues>();

  const [deleteTarget, setDeleteTarget] = useState<Gift | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [searchName, activeFilter]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const openCreate = () => {
    setEditingGift(null);
    form.resetFields();
    form.setFieldsValue({ name: '', description: '', isActive: true });
    setImageFile(null);
    setImagePreview('');
    setDrawerOpen(true);
  };

  const openEdit = (gift: Gift) => {
    setEditingGift(gift);
    form.resetFields();
    form.setFieldsValue({
      name: gift.name,
      description: gift.description ?? '',
      isActive: gift.isActive,
    });
    setImageFile(null);
    setImagePreview(resolveGiftImage(gift.image) ?? '');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingGift(null);
    setImageFile(null);
    setImagePreview('');
    form.resetFields();
  };

  const handleUploadChange = (info: any) => {
    const nextFile = info.fileList[0]?.originFileObj as File | undefined;
    if (!nextFile) return;
    const validation = validateGiftImage(nextFile);
    if (validation) {
      message.error(validation);
      return;
    }
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(nextFile);
    setImagePreview(URL.createObjectURL(nextFile));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingGift) {
        await update(editingGift._id, {
          name: values.name,
          description: values.description ?? '',
          isActive: values.isActive,
          imageFile: imageFile ?? undefined,
        });
      } else {
        await create({
          name: values.name,
          description: values.description ?? '',
          isActive: values.isActive,
          imageFile: imageFile ?? undefined,
        });
      }
      closeDrawer();
    } catch (error: any) {
      if (error?.errorFields) return;
      // Backend validation messages are shown by useApi.
    }
  };

  const handleToggleActive = async (gift: Gift) => {
    try {
      await update(gift._id, { isActive: !gift.isActive });
    } catch {
      // Backend validation messages are shown by useApi.
    }
  };

  const handleDelete = (key: React.Key) => {
    const gift = gifts.find((item) => item._id === String(key)) ?? null;
    setDeleteTarget(gift);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget._id);
      setDeleteTarget(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(extractApiErrorMessage(error));
    }
  };

  const deactivateInstead = async () => {
    if (!deleteTarget) return;
    setDeactivating(true);
    try {
      await update(deleteTarget._id, { isActive: false });
      setDeleteTarget(null);
      setDeleteError(null);
    } catch {
      // Backend validation messages are shown by useApi.
    } finally {
      setDeactivating(false);
    }
  };

  const columns = [
    {
      key: 'image',
      title: 'Image',
      render: (record: Gift) => (
        <Avatar
          shape="square"
          size={48}
          icon={<GiftOutlined />}
          src={resolveGiftImage(record.image)}
          style={{ backgroundColor: '#f56a00' }}
        />
      ),
    },
    {
      key: 'name',
      title: 'Name',
      render: (record: Gift) => <Text strong>{record.name}</Text>,
    },
    {
      key: 'description',
      title: 'Description',
      render: (record: Gift) => (
        <Text
          ellipsis={{ tooltip: record.description || '' }}
          style={{ maxWidth: 260 }}
        >
          {record.description || ''}
        </Text>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (record: Gift) => (
        <Tag color={record.isActive ? 'green' : 'default'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      key: 'createdBy',
      title: 'Created By',
      render: (record: Gift) => createdByName(record) || '',
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (record: Gift) => formatDateTime(record.createdAt),
    },
  ];

  return (
    <>
      <div style={{ padding: '24px', background: '#fff', borderRadius: 8 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Gifts
              </Typography.Title>
              <Text type="secondary">
                Manage the gifts that can be attached to badge definitions.
              </Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
            >
              Create Gift
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Text strong>Filter by:</Text>
            <Input
              placeholder="Search by name..."
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              style={{ width: 200 }}
              placeholder="All statuses"
              value={activeFilter ?? null}
              onChange={(value) => setActiveFilter(value ?? undefined)}
              allowClear
              options={activeFilterOptions}
            />
          </div>

          {isError && fetchError && (
            <Alert
              type="error"
              message="Failed to load gifts"
              description={extractApiErrorMessage(fetchError)}
              showIcon
              action={
                <Button size="small" onClick={() => void refetch()}>
                  Retry
                </Button>
              }
            />
          )}

          {gifts.length === 0 && !isLoading ? (
            <Empty description="No gifts yet">
              <Button type="primary" onClick={openCreate}>
                Create Your First Gift
              </Button>
            </Empty>
          ) : (
            <DataTable
              data={gifts}
              columns={columns}
              loading={isLoading}
              rowKey="_id"
              onEdit={openEdit}
              onDelete={handleDelete}
              extraRowActions={(record) => [
                {
                  key: record.isActive ? 'deactivate' : 'activate',
                  label: record.isActive ? 'Deactivate' : 'Activate',
                  onClick: () => void handleToggleActive(record),
                },
              ]}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (page, size) =>
                  setPagination({ page, pageSize: size || 10 }),
              }}
            />
          )}
        </Space>
      </div>

      <Drawer
        title={editingGift ? 'Edit Gift' : 'Create Gift'}
        width={520}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => void handleSave()}
              loading={isCreating || isUpdating}
            >
              {editingGift ? 'Save' : 'Create'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Gift image">
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar
                shape="square"
                size={112}
                icon={<GiftOutlined />}
                src={imagePreview || undefined}
                style={{ backgroundColor: '#f56a00' }}
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUploadChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>
                  {imagePreview ? 'Change image' : 'Upload image'}
                </Button>
              </Upload>
              <Text type="secondary" style={{ textAlign: 'center' }}>
                Optional. Image files only, maximum 2 MB.
                {editingGift?.image
                  ? ' A new image replaces the current one. The image cannot be removed.'
                  : ''}
              </Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Gift name is required' },
              { max: 120, message: 'Name must be at most 120 characters' },
            ]}
          >
            <Input placeholder="e.g., Water Bottle" maxLength={120} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                max: 500,
                message: 'Description must be at most 500 characters',
              },
            ]}
          >
            <TextArea
              placeholder="Describe the gift"
              maxLength={500}
              showCount
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            extra="Inactive gifts cannot be attached to new badge awards."
          >
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Delete this gift?"
        open={Boolean(deleteTarget)}
        onOk={() => void confirmDelete()}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
      >
        <p>
          {deleteTarget
            ? `Delete ${deleteTarget.name}? This cannot be undone.`
            : 'Delete this gift? This cannot be undone.'}
        </p>
        {deleteError ? (
          <Alert
            type="error"
            showIcon
            message="This gift cannot be deleted"
            description={
              <div>
                <p style={{ marginBottom: 8 }}>{deleteError}</p>
                <p style={{ marginBottom: 0 }}>
                  Deactivate the gift instead so it stays on existing awards but
                  cannot be used for new ones.
                </p>
                <Button
                  size="small"
                  style={{ marginTop: 12 }}
                  loading={deactivating}
                  onClick={() => void deactivateInstead()}
                >
                  Deactivate instead
                </Button>
              </div>
            }
          />
        ) : (
          <p style={{ marginBottom: 0 }}>
            If the gift is already used by a badge definition or an award, the
            backend will block the delete. You can deactivate it instead.
          </p>
        )}
      </Modal>
    </>
  );
}
