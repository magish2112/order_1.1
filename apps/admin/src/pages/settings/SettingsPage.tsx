import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Card, Space, message, Tabs, InputNumber, Upload, Image } from 'antd';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { apiMethods } from '../../lib/api';
import { Setting } from '../../lib/types';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [logoUploading, setLogoUploading] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: async () => {
      const response = await apiMethods.settings.list();
      return response.data.data as Setting[];
    },
  });

  useEffect(() => {
    if (settings) {
      const formValues: Record<string, any> = {};
      settings.forEach((setting) => {
        if (setting.type === 'json') {
          try {
            formValues[setting.key] = JSON.parse(setting.value);
          } catch {
            formValues[setting.key] = setting.value;
          }
        } else if (setting.type === 'boolean') {
          formValues[setting.key] = setting.value === 'true';
        } else if (setting.type === 'number') {
          formValues[setting.key] = Number(setting.value);
        } else {
          formValues[setting.key] = setting.value;
        }
        
        // Устанавливаем текущий логотип
        if (setting.key === 'logo') {
          setCurrentLogoUrl(setting.value || null);
        }
      });
      form.setFieldsValue(formValues);
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const settingsArray = Object.entries(values).map(([key, value]) => {
        const existingSetting = settings?.find((s) => s.key === key);
        let stringValue: string;
        
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = value || '';
        }

        const setting: {
          key: string;
          value: string;
          type: string;
          group?: string | null;
        } = {
          key,
          value: stringValue,
          type: existingSetting?.type || 'string',
        };

        // Добавляем group только если он существует, иначе не включаем в объект
        if (existingSetting?.group !== undefined && existingSetting?.group !== null) {
          setting.group = existingSetting.group;
        } else {
          setting.group = null;
        }

        return setting;
      });

      await apiMethods.settings.update(settingsArray);
    },
    onSuccess: () => {
      message.success('Настройки сохранены');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const onFinish = (values: Record<string, any>) => {
    mutation.mutate(values);
  };

  const logoUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await apiMethods.settings.uploadLogo(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
    },
    onSuccess: (response) => {
      message.success('Логотип успешно загружен');
      setCurrentLogoUrl(response.data.data.logoUrl);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка загрузки логотипа');
    },
    onSettled: () => {
      setLogoUploading(false);
    },
  });

  const handleLogoUpload: UploadProps['beforeUpload'] = (file) => {
    // Проверка типа файла
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Можно загружать только изображения!');
      return false;
    }

    // Проверка размера файла (5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Изображение должно быть меньше 5MB!');
      return false;
    }

    setLogoUploading(true);
    logoUploadMutation.mutate(file);
    return false; // Отменяем автоматическую загрузку
  };

  const tabItems = [
    {
      key: 'contacts',
      label: 'Контакты',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="phone" label="Телефон">
            <Input placeholder="+7 (999) 123-45-67" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" placeholder="info@example.com" />
          </Form.Item>
          <Form.Item name="address" label="Адрес">
            <TextArea rows={2} placeholder="Адрес офиса" />
          </Form.Item>
          <Form.Item name="workHours" label="Часы работы">
            <Input placeholder="Пн-Пт: 9:00 - 18:00" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'social',
      label: 'Социальные сети',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="telegram" label="Telegram">
            <Input placeholder="https://t.me/username" />
          </Form.Item>
          <Form.Item name="whatsapp" label="WhatsApp">
            <Input placeholder="https://wa.me/79991234567" />
          </Form.Item>
          <Form.Item name="vk" label="VK">
            <Input placeholder="https://vk.com/username" />
          </Form.Item>
          <Form.Item name="youtube" label="YouTube">
            <Input placeholder="https://youtube.com/@username" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'calculator',
      label: 'Калькулятор',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="basePriceCosmetic" label="Базовая цена (косметический ремонт, ₽/м²)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="basePriceCapital" label="Базовая цена (капитальный ремонт, ₽/м²)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="basePriceDesign" label="Базовая цена (дизайнерский ремонт, ₽/м²)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="basePriceElite" label="Базовая цена (элитный ремонт, ₽/м²)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'seo',
      label: 'SEO',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="defaultMetaTitle" label="Meta Title по умолчанию">
            <Input placeholder="Заголовок для SEO" />
          </Form.Item>
          <Form.Item name="defaultMetaDescription" label="Meta Description по умолчанию">
            <TextArea rows={3} placeholder="Описание для SEO" />
          </Form.Item>
          <Form.Item name="defaultMetaKeywords" label="Meta Keywords по умолчанию">
            <Input placeholder="Ключевые слова через запятую" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'design',
      label: 'Дизайн',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Логотип сайта">
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentLogoUrl && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>Текущий логотип:</div>
                  <Image
                    src={currentLogoUrl}
                    alt="Логотип"
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 8, padding: 8 }}
                    preview={true}
                  />
                </div>
              )}
              <Upload
                beforeUpload={handleLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={logoUploading}
                  disabled={logoUploading}
                >
                  {logoUploading ? 'Загрузка...' : currentLogoUrl ? 'Загрузить новый логотип' : 'Загрузить логотип'}
                </Button>
              </Upload>
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                Рекомендуемый формат: SVG, PNG или JPG. Максимальный размер: 5MB.
              </div>
            </Space>
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Настройки сайта</h1>

      <Card loading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Tabs items={tabItems} />
          
          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={mutation.isPending} size="large">
              Сохранить настройки
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

