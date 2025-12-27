import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input } from 'antd';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../lib/api';
import { Vacancy } from '../../lib/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export function VacanciesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { data: vacancies, isLoading } = useQuery({
    queryKey: ['vacancies', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.vacancies.list();
      return response.data.data as Vacancy[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.vacancies.delete(id);
    },
    onSuccess: () => {
      message.success('Вакансия удалена');
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const filteredData = vacancies?.filter((vacancy) =>
    vacancy.title.toLowerCase().includes(searchText.toLowerCase()) ||
    vacancy.department?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Vacancy> = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Отдел',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Опыт',
      dataIndex: 'experience',
      key: 'experience',
    },
    {
      title: 'Зарплата',
      key: 'salary',
      render: (_, record) => {
        if (record.salaryFrom && record.salaryTo) {
          return `${record.salaryFrom.toLocaleString('ru-RU')} - ${record.salaryTo.toLocaleString('ru-RU')} ₽`;
        }
        if (record.salaryFrom) {
          return `от ${record.salaryFrom.toLocaleString('ru-RU')} ₽`;
        }
        return 'По договоренности';
      },
    },
    {
      title: 'Тип занятости',
      dataIndex: 'employment',
      key: 'employment',
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активна' : 'Неактивна'}
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Edit />}
            onClick={() => navigate(`/vacancies/${record.id}`)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить вакансию?"
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
        <h1>Вакансии</h1>
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
            onClick={() => navigate('/vacancies/new')}
          >
            Добавить вакансию
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

