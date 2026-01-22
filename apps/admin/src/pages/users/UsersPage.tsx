import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Tag, Popconfirm, message, Input, Modal, Form, Select, Switch } from 'antd';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EDITOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Проверяем права доступа (только SUPER_ADMIN и ADMIN)
  const canManageUsers = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', 'admin', searchText],
    queryFn: async () => {
      const response = await apiMethods.users.list({ search: searchText });
      return {
        items: response.data.data as User[],
        pagination: response.data.pagination,
      };
    },
    enabled: canManageUsers,
  });

  const createMutation = useMutation({
    mutationFn: async (values: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'MANAGER';
      isActive?: boolean;
    }) => {
      return await apiMethods.users.create(values);
    },
    onSuccess: () => {
      message.success('Пользователь успешно создан');
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка создания пользователя');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiMethods.users.update(id, data);
    },
    onSuccess: () => {
      message.success('Пользователь успешно обновлен');
      form.resetFields();
      setIsModalVisible(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка обновления пользователя');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.users.delete(id);
    },
    onSuccess: () => {
      message.success('Пользователь удален');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'MANAGER', isActive: true });
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    if (editingUser) {
      // При обновлении пароль не обязателен
      const updateData: any = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        isActive: values.isActive,
      };
      if (values.password) {
        updateData.password = values.password;
      }
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      createMutation.mutate({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: 'MANAGER', // Только менеджеры
        isActive: values.isActive ?? true,
      });
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Имя',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleLabels: Record<string, string> = {
          SUPER_ADMIN: 'Супер-администратор',
          ADMIN: 'Администратор',
          MANAGER: 'Менеджер',
          EDITOR: 'Редактор',
        };
        return <Tag color={role === 'SUPER_ADMIN' || role === 'ADMIN' ? 'red' : 'blue'}>{roleLabels[role] || role}</Tag>;
      },
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
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
            disabled={record.id === currentUser?.id}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить пользователя?"
            description="Это действие нельзя отменить"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
            disabled={record.id === currentUser?.id}
          >
            <Button
              type="link"
              danger
              icon={<Trash2 size={16} />}
              disabled={record.id === currentUser?.id}
            >
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!canManageUsers) {
    return (
      <div>
        <h1>Управление пользователями</h1>
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
          <p>У вас нет прав для управления пользователями. Только администраторы могут управлять пользователями.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Управление пользователями</h1>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleCreate}
        >
          Создать менеджера
        </Button>
      </Space>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск по email, имени или фамилии"
          prefix={<Search size={16} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={usersData?.items || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: usersData?.pagination?.page || 1,
          pageSize: usersData?.pagination?.limit || 20,
          total: usersData?.pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Создать менеджера'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              ...(editingUser ? [] : [{ required: true, message: 'Введите пароль' }]),
              { min: 8, message: 'Пароль должен содержать минимум 8 символов' },
              {
                pattern: /[A-Z]/,
                message: 'Пароль должен содержать хотя бы одну заглавную букву',
              },
              {
                pattern: /[a-z]/,
                message: 'Пароль должен содержать хотя бы одну строчную букву',
              },
              {
                pattern: /[0-9]/,
                message: 'Пароль должен содержать хотя бы одну цифру',
              },
            ]}
            help={editingUser ? 'Оставьте пустым, если не хотите менять пароль' : undefined}
          >
            <Input.Password placeholder={editingUser ? 'Оставить без изменений' : 'Минимум 8 символов'} />
          </Form.Item>

          <Form.Item
            name="firstName"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input placeholder="Иван" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Фамилия"
            rules={[{ required: true, message: 'Введите фамилию' }]}
          >
            <Input placeholder="Иванов" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select placeholder="Выберите роль" disabled={!!editingUser}>
              <Option value="MANAGER">Менеджер</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Активен"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingUser ? 'Сохранить' : 'Создать'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingUser(null);
              }}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
