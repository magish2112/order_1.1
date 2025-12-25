import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Switch, Button, Card, Space, message, Select, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { ServiceCategory } from '../../lib/types';

const { TextArea } = Input;

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';

  const { data: category, isLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await apiMethods.categories.get(id!);
      return response.data.data as ServiceCategory;
    },
    enabled: !isNew,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.categories.list();
      return response.data.data as ServiceCategory[];
    },
  });

  useEffect(() => {
    if (category && !isNew) {
      form.setFieldsValue(category);
    }
  }, [category, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (isNew) {
        await apiMethods.categories.create(values);
      } else {
        await apiMethods.categories.update(id!, values);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Категория создана' : 'Категория обновлена');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate('/services/categories');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/services/categories')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать категорию' : 'Редактировать категорию'}</h1>
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
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Название категории" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (URL)">
            <Input placeholder="Автоматически генерируется из названия" />
          </Form.Item>

          <Form.Item name="parentId" label="Родительская категория">
            <Select
              placeholder="Выберите родительскую категорию"
              allowClear
              options={categories
                ?.filter((c) => c.id !== id)
                .map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>

          <Form.Item name="shortDescription" label="Краткое описание">
            <TextArea rows={2} placeholder="Краткое описание для превью" />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={4} placeholder="Полное описание категории" />
          </Form.Item>

          <Form.Item name="image" label="Изображение (URL)">
            <Input placeholder="URL изображения" />
          </Form.Item>

          <Form.Item name="icon" label="Иконка">
            <Input placeholder="Название иконки или URL" />
          </Form.Item>

          <Form.Item name="order" label="Порядок сортировки">
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Активна">
            <Switch />
          </Form.Item>

          <Card title="SEO настройки" style={{ marginTop: 16 }}>
            <Form.Item name="metaTitle" label="Meta Title">
              <Input placeholder="Заголовок для SEO" />
            </Form.Item>

            <Form.Item name="metaDescription" label="Meta Description">
              <TextArea rows={3} placeholder="Описание для SEO" />
            </Form.Item>

            <Form.Item name="metaKeywords" label="Meta Keywords">
              <Input placeholder="Ключевые слова через запятую" />
            </Form.Item>
          </Card>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={mutation.isPending}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

