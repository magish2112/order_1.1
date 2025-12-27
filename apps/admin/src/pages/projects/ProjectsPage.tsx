import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input, Select } from 'antd';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Project } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', 'admin', statusFilter],
    queryFn: async () => {
      const response = await apiMethods.projects.list({ 
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined 
      });
      return response.data.data as Project[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.projects.delete(id);
    },
    onSuccess: () => {
      message.success('Проект удален');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const filteredData = projects?.filter((Project) =>
    Project.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Project> = [
    {
      title: 'Название',
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
      title: 'Площадь',
      dataIndex: 'area',
      key: 'area',
      render: (area: number | null) => area ? `${area} м²` : '-',
    },
    {
      title: 'Комнаты',
      dataIndex: 'rooms',
      key: 'rooms',
      render: (rooms: number | null) => rooms || '-',
    },
    {
      title: 'Стоимость',
      dataIndex: 'price',
      key: 'price',
      render: (price: number | null) => price ? `${price.toLocaleString('ru-RU')} ₽` : '-',
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Активен' : 'Неактивен'}
          </Tag>
          {record.isFeatured && <Tag color="blue">Рекомендуемый</Tag>}
        </Space>
      ),
    },
    {
      title: 'Просмотры',
      dataIndex: 'viewsCount',
      key: 'viewsCount',
      sorter: (a, b) => a.viewsCount - b.viewsCount,
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Eye />}
            onClick={() => window.open(`/portfolio/${record.slug}`, '_blank')}
          >
            Просмотр
          </Button>
          <Button
            type="link"
            icon={<Edit />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить проект?"
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
        <h1>Проекты</h1>
        <Space>
          <Select
            placeholder="Фильтр по статусу"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Активные' },
              { value: 'inactive', label: 'Неактивные' },
            ]}
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
            onClick={() => navigate('/projects/new')}
          >
            Добавить проект
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

