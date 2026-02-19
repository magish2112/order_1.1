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
  Row,
  Col,
} from 'antd';
import { Save, ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUrl';
import { Project, ServiceCategory, Service } from '../../lib/types';
import { TiptapEditor } from '../../components/editor/TiptapEditor';

const { TextArea } = Input;

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [designImages, setDesignImages] = useState<string[]>([]);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await apiMethods.projects.get(id!);
      return response.data.data as Project;
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

  const { data: services } = useQuery({
    queryKey: ['services', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.services.list();
      return response.data.data as Service[];
    },
  });

  useEffect(() => {
    if (project && !isNew) {
      form.setFieldsValue({
        ...project,
        serviceIds: project.serviceIds || [],
      });
      setBeforeImages(project.beforeImages || []);
      setAfterImages(project.afterImages || []);
      setDesignImages(project.designImages || []);
    }
  }, [project, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const data = {
        ...values,
        beforeImages,
        afterImages,
        designImages,
      };
      if (isNew) {
        await apiMethods.projects.create(data);
      } else {
        await apiMethods.projects.update(id!, data);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Проект создан' : 'Проект обновлен');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after' | 'design' | 'cover') => {
    try {
      const response = await apiMethods.media.upload(file, 'projects');
      const imageUrl = response.data.data.url;
      const fullUrl = getImageUrl(imageUrl);
      
      if (type === 'cover') {
        form.setFieldValue('coverImage', fullUrl);
      } else if (type === 'before') {
        setBeforeImages([...beforeImages, fullUrl]);
      } else if (type === 'after') {
        setAfterImages([...afterImages, fullUrl]);
      } else {
        setDesignImages([...designImages, fullUrl]);
      }
      message.success('Изображение загружено');
    } catch (error) {
      message.error('Ошибка загрузки изображения');
      console.error('Upload error:', error);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeft />} onClick={() => navigate('/projects')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать проект' : 'Редактировать проект'}</h1>
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
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="Название"
                rules={[{ required: true, message: 'Введите название' }]}
              >
                <Input placeholder="Название проекта" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="slug" label="Slug (URL)">
                <Input placeholder="Автоматически генерируется" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Краткое описание">
            <TextArea rows={3} placeholder="Краткое описание для превью" />
          </Form.Item>

          <Form.Item name="content" label="Полное описание">
            <TiptapEditor
              value={form.getFieldValue('content')}
              onChange={(html) => form.setFieldValue('content', html)}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="area" label="Площадь (м²)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="rooms" label="Количество комнат">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="duration" label="Срок (дни)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="price" label="Стоимость (₽)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="location" label="Местоположение">
                <Input placeholder="ЖК, адрес" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="style" label="Стиль">
                <Input placeholder="Современный, лофт, классика..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="propertyType" label="Тип помещения">
                <Select placeholder="Выберите тип">
                  <Select.Option value="квартира">Квартира</Select.Option>
                  <Select.Option value="дом">Дом</Select.Option>
                  <Select.Option value="офис">Офис</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="categoryId" label="Категория">
            <Select
              placeholder="Выберите категорию"
              allowClear
              options={categories?.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>

          <Form.Item name="serviceIds" label="Услуги">
            <Select
              mode="multiple"
              placeholder="Выберите услуги"
              options={services?.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <Form.Item name="coverImage" label="Обложка проекта">
            <Space direction="vertical" style={{ width: '100%' }}>
              {form.getFieldValue('coverImage') && (
                <img
                  src={form.getFieldValue('coverImage')}
                  alt="Обложка"
                  style={{ width: 300, height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <Space>
                <Upload
                  beforeUpload={(file) => {
                    handleImageUpload(file, 'cover');
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadIcon />}>Загрузить обложку</Button>
                </Upload>
                <Input 
                  placeholder="или введите URL" 
                  value={form.getFieldValue('coverImage')}
                  onChange={(e) => form.setFieldValue('coverImage', e.target.value)}
                  style={{ width: 300 }}
                />
              </Space>
            </Space>
          </Form.Item>

          <Card title="Фото до ремонта" style={{ marginBottom: 16 }}>
            <Space wrap>
              {beforeImages.map((url, index) => (
                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={url}
                    alt={`До ${index + 1}`}
                    style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    style={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => setBeforeImages(beforeImages.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file, 'before');
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadIcon />}>Добавить фото</Button>
              </Upload>
            </Space>
          </Card>

          <Card title="Фото после ремонта" style={{ marginBottom: 16 }}>
            <Space wrap>
              {afterImages.map((url, index) => (
                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={url}
                    alt={`После ${index + 1}`}
                    style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    style={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => setAfterImages(afterImages.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file, 'after');
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadIcon />}>Добавить фото</Button>
              </Upload>
            </Space>
          </Card>

          <Card title="3D визуализации" style={{ marginBottom: 16 }}>
            <Space wrap>
              {designImages.map((url, index) => (
                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={url}
                    alt={`Дизайн ${index + 1}`}
                    style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    style={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => setDesignImages(designImages.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file, 'design');
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadIcon />}>Добавить визуализацию</Button>
              </Upload>
            </Space>
          </Card>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isActive" valuePropName="checked" label="Активен">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isFeatured" valuePropName="checked" label="Рекомендуемый">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order" label="Порядок сортировки">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Card title="SEO настройки" style={{ marginTop: 16 }}>
            <Form.Item name="metaTitle" label="Meta Title">
              <Input placeholder="Заголовок для SEO" />
            </Form.Item>
            <Form.Item name="metaDescription" label="Meta Description">
              <TextArea rows={3} placeholder="Описание для SEO" />
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

