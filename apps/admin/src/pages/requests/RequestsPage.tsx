import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Modal,
  Form,
  message,
  DatePicker,
} from 'antd';
import { EditOutlined, SearchOutlined } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { Request } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export function RequestsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['requests', 'admin', statusFilter, searchText],
    queryFn: async () => {
      const response = await apiMethods.requests.list({
        status: statusFilter,
        search: searchText || undefined,
      });
      return response.data.data as Request[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      await apiMethods.requests.updateStatus(id, status, notes);
    },
    onSuccess: () => {
      message.success('Статус обновлен');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setIsModalVisible(false);
      setSelectedRequest(null);
      form.resetFields();
    },
  });

  const handleStatusChange = (request: Request) => {
    setSelectedRequest(request);
    form.setFieldsValue({ status: request.status, notes: request.notes });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (selectedRequest) {
        updateStatusMutation.mutate({
          id: selectedRequest.id,
          status: values.status,
          notes: values.notes,
        });
      }
    });
  };

  const statusColors: Record<string, string> = {
    NEW: 'blue',
    IN_PROGRESS: 'orange',
    CONTACTED: 'cyan',
    CONVERTED: 'green',
    REJECTED: 'red',
    SPAM: 'default',
  };

  const statusLabels: Record<string, string> = {
    NEW: 'Новая',
    IN_PROGRESS: 'В работе',
    CONTACTED: 'Связались',
    CONVERTED: 'Конвертирована',
    REJECTED: 'Отклонена',
    SPAM: 'Спам',
  };

  const columns: ColumnsType<Request> = [
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
      filters: Object.keys(statusLabels).map((key) => ({
        text: statusLabels[key],
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Источник',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleStatusChange(record)}
        >
          Изменить статус
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <h1>Заявки</h1>
        <Space>
          <Select
            placeholder="Фильтр по статусу"
            allowClear
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Input
            placeholder="Поиск..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title="Изменить статус заявки"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedRequest(null);
          form.resetFields();
        }}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Статус"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select>
              {Object.entries(statusLabels).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Заметки">
            <TextArea rows={4} placeholder="Добавьте заметки о заявке" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

