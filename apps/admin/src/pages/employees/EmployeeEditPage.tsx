import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Switch, Button, Card, Space, message, Select, InputNumber, Upload } from 'antd';
import { Save, ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUrl';
import { Employee } from '../../lib/types';

const { TextArea } = Input;

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await apiMethods.employees.get(id!);
      return response.data.data as Employee;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (employee && !isNew) {
      form.setFieldsValue(employee);
    }
  }, [employee, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (isNew) {
        await apiMethods.employees.create(values);
      } else {
        await apiMethods.employees.update(id!, values);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Сотрудник создан' : 'Сотрудник обновлен');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const response = await apiMethods.media.upload(file, 'employees');
      const imageUrl = response.data.data.url;
      const fullUrl = getImageUrl(imageUrl);
      
      form.setFieldValue('photo', fullUrl);
      message.success('Фото загружено');
    } catch (error) {
      message.error('Ошибка загрузки фото');
      console.error('Upload error:', error);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeft />} onClick={() => navigate('/employees')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать сотрудника' : 'Редактировать сотрудника'}</h1>
      </Space>

      <Card loading={isLoading && !isNew}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            order: 0,
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="photo" label="Фото">
              {form.getFieldValue('photo') && (
                <img
                  src={form.getFieldValue('photo')}
                  alt="Фото"
                  style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <Upload
                beforeUpload={(file) => {
                  handlePhotoUpload(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadIcon />}>Загрузить фото</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: true, message: 'Введите имя' }]}
            >
              <Input placeholder="Имя" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: true, message: 'Введите фамилию' }]}
            >
              <Input placeholder="Фамилия" />
            </Form.Item>

            <Form.Item
              name="position"
              label="Должность"
              rules={[{ required: true, message: 'Введите должность' }]}
            >
              <Input placeholder="Должность" />
            </Form.Item>

            <Form.Item name="department" label="Отдел">
              <Select placeholder="Выберите отдел">
                <Select.Option value="Дизайнеры">Дизайнеры</Select.Option>
                <Select.Option value="Прорабы">Прорабы</Select.Option>
                <Select.Option value="Менеджеры">Менеджеры</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="bio" label="Биография">
              <TextArea rows={4} placeholder="Краткая биография сотрудника" />
            </Form.Item>

            <Form.Item name="order" label="Порядок сортировки">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="isActive" valuePropName="checked" label="Активен">
              <Switch />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" icon={<Save />} loading={mutation.isPending}>
                Сохранить
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

