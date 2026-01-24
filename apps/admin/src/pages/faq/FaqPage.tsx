import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Faq } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';

export function FaqPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.faqs.list({ limit: 100 });
      return response.data.data as Faq[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.faqs.delete(id);
    },
    onSuccess: () => {
      message.success('FAQ удален');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const filteredData = faqs?.filter((faq) =>
    faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Faq> = [
    {
      title: 'Вопрос',
      dataIndex: 'question',
      key: 'question',
      sorter: (a, b) => a.question.localeCompare(b.question),
      ellipsis: true,
    },
    {
      title: 'Ответ',
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
      render: (text: string) => text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: string | null) => category ? <Tag>{category}</Tag> : '-',
    },
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/faq/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить FAQ?"
            description="Это действие нельзя отменить"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>FAQ</h1>
        <Space>
          <Input
            placeholder="Поиск..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/faq/new')}
          >
            Добавить вопрос
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}

