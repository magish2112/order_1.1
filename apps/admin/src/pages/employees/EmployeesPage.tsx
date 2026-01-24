import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input } from 'antd';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Employee } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';

export function EmployeesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.employees.list({ limit: 100 });
      return response.data.data as Employee[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.employees.delete(id);
    },
    onSuccess: () => {
      message.success('Сотрудник удален');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const filteredData = employees?.filter((employee) =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Employee> = [
    {
      title: 'Фото',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo: string | null, record: Employee) =>
        photo ? (
          <img
            src={photo}
            alt=""
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {record.firstName?.[0] || '?'}
          </div>
        ),
    },
    {
      title: 'Имя',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Отдел',
      dataIndex: 'department',
      key: 'department',
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
            icon={<Edit />}
            onClick={() => navigate(`/employees/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить сотрудника?"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Сотрудники</h1>
        <Space>
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
            onClick={() => navigate('/employees/new')}
          >
            Добавить сотрудника
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

