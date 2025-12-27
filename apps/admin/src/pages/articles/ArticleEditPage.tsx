import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  Switch,
  Button,
  Card,
  Space,
  message,
  Select,
  DatePicker,
} from 'antd';
import { Save, ArrowLeft } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { Article, ArticleCategory } from '../../lib/types';
import { TiptapEditor } from '../../components/editor/TiptapEditor';
import dayjs from 'dayjs';

const { TextArea } = Input;

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const response = await apiMethods.articles.get(id!);
      return response.data.data as Article;
    },
    enabled: !isNew,
  });

  const { data: categories } = useQuery({
    queryKey: ['articleCategories'],
    queryFn: async () => {
      // TODO: Добавить отдельный endpoint для категорий статей
      await apiMethods.articles.list({});
      return [] as ArticleCategory[];
    },
  });

  useEffect(() => {
    if (article && !isNew) {
      form.setFieldsValue({
        ...article,
        publishedAt: article.publishedAt ? dayjs(article.publishedAt) : null,
      });
    }
  }, [article, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const data = {
        ...values,
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : null,
      };
      if (isNew) {
        await apiMethods.articles.create(data);
      } else {
        await apiMethods.articles.update(id!, data);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Статья создана' : 'Статья обновлена');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      navigate('/articles');
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
        <Button icon={<ArrowLeft />} onClick={() => navigate('/articles')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать статью' : 'Редактировать статью'}</h1>
      </Space>

      <Card loading={isLoading && !isNew}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isPublished: false,
          }}
        >
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input placeholder="Заголовок статьи" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (URL)">
            <Input placeholder="Автоматически генерируется из заголовка" />
          </Form.Item>

          <Form.Item name="excerpt" label="Краткое описание">
            <TextArea rows={3} placeholder="Краткое описание для превью" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Содержание"
            rules={[{ required: true, message: 'Введите содержание' }]}
          >
            <TiptapEditor
              value={form.getFieldValue('content')}
              onChange={(html) => form.setFieldValue('content', html)}
            />
          </Form.Item>

          <Form.Item name="coverImage" label="Обложка (URL)">
            <Input placeholder="URL изображения обложки" />
          </Form.Item>

          <Form.Item name="categoryId" label="Категория">
            <Select
              placeholder="Выберите категорию"
              allowClear
              options={categories?.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>

          <Space>
            <Form.Item name="isPublished" valuePropName="checked" label="Опубликована">
              <Switch />
            </Form.Item>
            <Form.Item name="publishedAt" label="Дата публикации">
              <DatePicker showTime />
            </Form.Item>
          </Space>

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
            <Button type="primary" htmlType="submit" icon={<Save />} loading={mutation.isPending}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

