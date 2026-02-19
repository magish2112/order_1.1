import { useEffect, useState } from 'react';
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
  InputNumber,
  Upload,
  Image,
} from 'antd';
import { Save, ArrowLeft, Upload as UploadIcon, Trash2 } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUrl';
import { Service, ServiceCategory } from '../../lib/types';
import { TiptapEditor } from '../../components/editor/TiptapEditor';

const { TextArea } = Input;

export function ServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';
  const [gallery, setGallery] = useState<string[]>([]);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await apiMethods.services.get(id!);
      return response.data.data as Service;
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
    if (service && !isNew) {
      form.setFieldsValue({
        ...service,
        featuresJson: service.features ? JSON.stringify(service.features, null, 2) : '',
      });
      setGallery(service.gallery || []);
    }
  }, [service, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      let features: Record<string, any> | undefined;
      if (values.featuresJson) {
        try {
          features = JSON.parse(values.featuresJson);
        } catch {
          throw new Error('Некорректный JSON в поле "Характеристики"');
        }
      }

      const data = {
        ...values,
        gallery,
        features,
      };
      delete data.featuresJson;

      if (isNew) {
        await apiMethods.services.create(data);
      } else {
        await apiMethods.services.update(id!, data);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Услуга создана' : 'Услуга обновлена');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      navigate('/services/list');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || error?.message || 'Ошибка сохранения');
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  const uploadImage = async (file: File, type: 'cover' | 'gallery') => {
    try {
      const response = await apiMethods.media.upload(file, 'services');
      const imageUrl = response.data.data.url;
      const fullUrl = getImageUrl(imageUrl);

      if (type === 'cover') {
        form.setFieldValue('image', fullUrl);
      } else {
        setGallery((prev) => [...prev, fullUrl]);
      }
      message.success('Изображение загружено');
    } catch {
      message.error('Ошибка загрузки изображения');
    }
  };

  const removeGalleryImage = (url: string) => {
    setGallery((prev) => prev.filter((item) => item !== url));
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeft />} onClick={() => navigate('/services/list')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать услугу' : 'Редактировать услугу'}</h1>
      </Space>

      <Card loading={isLoading && !isNew}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            isFeatured: false,
            order: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Название услуги" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (URL)">
            <Input placeholder="Автоматически генерируется из названия" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Категория"
            rules={[{ required: true, message: 'Выберите категорию' }]}
          >
            <Select
              placeholder="Выберите категорию"
              options={categories?.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>

          <Form.Item name="shortDescription" label="Краткое описание">
            <TextArea rows={2} placeholder="Краткое описание для превью" />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={4} placeholder="Полное описание услуги" />
          </Form.Item>

          <Form.Item name="content" label="Контент">
            <TiptapEditor
              value={form.getFieldValue('content')}
              onChange={(html) => form.setFieldValue('content', html)}
            />
          </Form.Item>

          <Card title="Цена и параметры" style={{ marginTop: 16 }}>
            <Form.Item name="priceFrom" label="Цена от">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="priceTo" label="Цена до">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="priceUnit" label="Ед. измерения">
              <Input placeholder="руб., ₽/м², и т.д." />
            </Form.Item>
            <Form.Item name="duration" label="Сроки">
              <Input placeholder="Например: 2-4 недели" />
            </Form.Item>
          </Card>

          <Card title="Изображения" style={{ marginTop: 16 }}>
            <Form.Item name="image" label="Обложка (URL)">
              <Input placeholder="URL изображения" />
            </Form.Item>
            {form.getFieldValue('image') && (
              <Image
                src={form.getFieldValue('image')}
                alt="Cover"
                width={200}
                height={200}
                style={{ objectFit: 'contain', marginBottom: 12 }}
                preview
              />
            )}
            <Upload
              beforeUpload={(file) => {
                uploadImage(file, 'cover');
                return false;
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadIcon />}>Загрузить обложку</Button>
            </Upload>

            <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 500 }}>Галерея</div>
            <Upload
              beforeUpload={(file) => {
                uploadImage(file, 'gallery');
                return false;
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadIcon />}>Добавить в галерею</Button>
            </Upload>

            {gallery.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {gallery.map((url) => (
                  <div key={url} style={{ width: 140 }}>
                    <Image
                      src={url}
                      alt="Gallery"
                      width={140}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: 6 }}
                      preview
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<Trash2 />}
                      onClick={() => removeGalleryImage(url)}
                      style={{ width: '100%' }}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Form.Item name="order" label="Порядок сортировки" style={{ marginTop: 16 }}>
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Активна">
            <Switch />
          </Form.Item>

          <Form.Item name="isFeatured" valuePropName="checked" label="Рекомендуемая">
            <Switch />
          </Form.Item>

          <Form.Item name="featuresJson" label="Характеристики (JSON)">
            <TextArea rows={4} placeholder='{"ключ": "значение"}' />
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
            <Button type="primary" htmlType="submit" icon={<Save />} loading={mutation.isPending}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
