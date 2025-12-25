import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Service } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';

export function ServicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'admin', categoryFilter],
    queryFn: async () => {
      const response = await apiMethods.services.list({ categoryId: categoryFilter });
      return response.data.data as Service[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.categories.list();
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.services.delete(id);
    },
    onSuccess: () => {
      message.success('Услуга удалена');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const filteredData = services?.filter((service) =>
    service.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Service> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => category?.name || '-',
    },
    {
      title: 'Цена',
      key: 'price',
      render: (_, record) => {
        if (record.priceFrom && record.priceTo) {
          return `${record.priceFrom} - ${record.priceTo} ${record.priceUnit || 'руб.'}`;
        }
        if (record.priceFrom) {
          return `от ${record.priceFrom} ${record.priceUnit || 'руб.'}`;
        }
        return '-';
      },
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Активна' : 'Неактивна'}
          </Tag>
          {record.isFeatured && <Tag color="blue">Рекомендуемая</Tag>}
        </Space>
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
            onClick={() => navigate(`/services/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить услугу?"
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
        <h1>Услуги</h1>
        <Space>
          <Select
            placeholder="Фильтр по категории"
            allowClear
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories?.map((c) => ({ value: c.id, label: c.name }))}
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
            onClick={() => navigate('/services/new')}
          >
            Добавить услугу
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

