import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Switch, Button, Card, Space, message, Select, InputNumber, Upload } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { apiMethods } from '../../lib/api';
import { Review, Project } from '../../lib/types';

const { TextArea } = Input;

export function ReviewEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const response = await apiMethods.reviews.get(id!);
      return response.data.data as Review;
    },
    enabled: !isNew,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.projects.list();
      return response.data.data as Project[];
    },
  });

  useEffect(() => {
    if (review && !isNew) {
      form.setFieldsValue(review);
    }
  }, [review, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (isNew) {
        await apiMethods.reviews.create(values);
      } else {
        await apiMethods.reviews.update(id!, values);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Отзыв создан' : 'Отзыв обновлен');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      navigate('/reviews');
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
      const response = await apiMethods.media.upload(file);
      const url = response.data.data.url;
      form.setFieldValue('authorPhoto', url);
      message.success('Фото загружено');
    } catch (error) {
      message.error('Ошибка загрузки фото');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reviews')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать отзыв' : 'Редактировать отзыв'}</h1>
      </Space>

      <Card loading={isLoading && !isNew}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            rating: 5,
            isApproved: false,
          }}
        >
          <Form.Item name="authorPhoto" label="Фото автора">
            {form.getFieldValue('authorPhoto') && (
              <img
                src={form.getFieldValue('authorPhoto')}
                alt="Фото"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
              />
            )}
            <Upload
              beforeUpload={(file) => {
                handlePhotoUpload(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Загрузить фото</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="authorName"
            label="Имя автора"
            rules={[{ required: true, message: 'Введите имя автора' }]}
          >
            <Input placeholder="Имя автора" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Текст отзыва"
            rules={[{ required: true, message: 'Введите текст отзыва' }]}
          >
            <TextArea rows={6} placeholder="Текст отзыва" />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Рейтинг"
            rules={[{ required: true, message: 'Выберите рейтинг' }]}
          >
            <InputNumber min={1} max={5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="projectId" label="Проект">
            <Select
              placeholder="Выберите проект"
              allowClear
              options={projects?.map((p) => ({ value: p.id, label: p.title }))}
            />
          </Form.Item>

          <Form.Item name="source" label="Источник">
            <Select placeholder="Выберите источник">
              <Select.Option value="internal">Внутренний</Select.Option>
              <Select.Option value="yandex">Яндекс</Select.Option>
              <Select.Option value="google">Google</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="sourceUrl" label="URL источника">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="isApproved" valuePropName="checked" label="Одобрен">
            <Switch />
          </Form.Item>

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
