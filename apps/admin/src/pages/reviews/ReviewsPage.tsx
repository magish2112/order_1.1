import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input, Switch } from 'antd';
import { Plus, Edit, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Review } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export function ReviewsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [approvedFilter, setApprovedFilter] = useState<boolean | undefined>();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', 'admin', approvedFilter],
    queryFn: async () => {
      const response = await apiMethods.reviews.list({ 
        isApproved: approvedFilter 
      });
      return response.data.data as Review[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.reviews.delete(id);
    },
    onSuccess: () => {
      message.success('Отзыв удален');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.reviews.approve(id);
    },
    onSuccess: () => {
      message.success('Отзыв одобрен');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const filteredData = reviews?.filter((review) =>
    review.authorName.toLowerCase().includes(searchText.toLowerCase()) ||
    review.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Review> = [
    {
      title: 'Автор',
      key: 'author',
      render: (_, record) => (
        <Space>
          {record.authorPhoto && (
            <img
              src={record.authorPhoto}
              alt={record.authorName}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <span>{record.authorName}</span>
        </Space>
      ),
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Space>
          {'★'.repeat(rating)}
          {'☆'.repeat(5 - rating)}
          <span>({rating})</span>
        </Space>
      ),
    },
    {
      title: 'Текст',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    },
    {
      title: 'Проект',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => project?.title || '-',
    },
    {
      title: 'Источник',
      dataIndex: 'source',
      key: 'source',
      render: (source: string | null) => source ? <Tag>{source}</Tag> : '-',
    },
    {
      title: 'Статус',
      dataIndex: 'isApproved',
      key: 'isApproved',
      render: (isApproved: boolean) => (
        <Tag color={isApproved ? 'green' : 'orange'}>
          {isApproved ? 'Одобрен' : 'На модерации'}
        </Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          {!record.isApproved && (
            <Button
              type="link"
              icon={<CheckCircle2 />}
              onClick={() => approveMutation.mutate(record.id)}
            >
              Одобрить
            </Button>
          )}
          <Button
            type="link"
            icon={<Edit />}
            onClick={() => navigate(`/reviews/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить отзыв?"
            description="Это действие нельзя отменить"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="link" danger icon={<Trash2 />}>
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
        <h1>Отзывы</h1>
        <Space>
          <Switch
            checkedChildren="Одобренные"
            unCheckedChildren="Все"
            checked={approvedFilter === true}
            onChange={(checked) => setApprovedFilter(checked ? true : undefined)}
          />
          <Input
            placeholder="Поиск..."
            prefix={<Search />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<Plus />}
            onClick={() => navigate('/reviews/new')}
          >
            Добавить отзыв
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

