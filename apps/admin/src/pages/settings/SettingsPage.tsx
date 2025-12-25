import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Card, Space, message, Tabs, Switch, InputNumber } from 'antd';
import { SaveOutlined } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { Setting } from '../../lib/types';

const { TextArea } = Input;

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

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

        return {
          key,
          value: stringValue,
          type: existingSetting?.type || 'string',
          group: existingSetting?.group,
        };
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

