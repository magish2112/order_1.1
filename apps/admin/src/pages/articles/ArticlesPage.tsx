import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, CheckCircleOutlined } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Article } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export function ArticlesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', 'admin', statusFilter],
    queryFn: async () => {
      const response = await apiMethods.articles.list({ 
        isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined 
      });
      return response.data.data as Article[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.articles.delete(id);
    },
    onSuccess: () => {
      message.success('Статья удалена');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.articles.publish(id);
    },
    onSuccess: () => {
      message.success('Статья опубликована');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const filteredData = articles?.filter((article) =>
    article.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Article> = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <Space>
          {record.coverImage && (
            <img
              src={record.coverImage}
              alt={text}
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Автор',
      dataIndex: 'author',
      key: 'author',
      render: (author: any) => author ? `${author.firstName} ${author.lastName}` : '-',
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => category?.name || '-',
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isPublished ? 'green' : 'orange'}>
          {record.isPublished ? 'Опубликована' : 'Черновик'}
        </Tag>
      ),
    },
    {
      title: 'Просмотры',
      dataIndex: 'viewsCount',
      key: 'viewsCount',
      sorter: (a, b) => a.viewsCount - b.viewsCount,
    },
    {
      title: 'Дата публикации',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string | null) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          {!record.isPublished && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => publishMutation.mutate(record.id)}
            >
              Опубликовать
            </Button>
          )}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/stati/${record.slug}`, '_blank')}
          >
            Просмотр
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/articles/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить статью?"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <h1>Статьи</h1>
        <Space>
          <Select
            placeholder="Фильтр по статусу"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'published', label: 'Опубликованные' },
              { value: 'draft', label: 'Черновики' },
            ]}
          />
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
            onClick={() => navigate('/articles/new')}
          >
            Добавить статью
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

