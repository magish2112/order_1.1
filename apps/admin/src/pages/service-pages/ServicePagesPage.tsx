import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { apiMethods } from '../../lib/api';
import { Setting } from '../../lib/types';

const { TextArea } = Input;

const PAGE_KEYS = [
  { key: 'page_uslugi_remont', label: 'Ремонт', slug: 'remont' },
  { key: 'page_uslugi_dizajn', label: 'Дизайн', slug: 'dizajn' },
  { key: 'page_uslugi_komplektaciya', label: 'Комплектация', slug: 'komplektaciya' },
  { key: 'page_uslugi_mebel', label: 'Мебель', slug: 'mebel' },
] as const;

export interface PageContent {
  metaTitle?: string;
  metaDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  content?: string;
}

const defaultPageContent: PageContent = {
  metaTitle: '',
  metaDescription: '',
  heroTitle: '',
  heroSubtitle: '',
  content: '',
};

function parsePageContent(value: unknown): PageContent {
  if (!value) return { ...defaultPageContent };
  if (typeof value === 'string') {
    try {
      return { ...defaultPageContent, ...JSON.parse(value) };
    } catch {
      return { ...defaultPageContent, content: value };
    }
  }
  if (typeof value === 'object' && value !== null) {
    return { ...defaultPageContent, ...(value as Record<string, unknown>) };
  }
  return { ...defaultPageContent };
}

export function ServicePagesPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('page_uslugi_remont');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'admin', 'pages'],
    queryFn: async () => {
      const response = await apiMethods.settings.list({ group: 'pages' });
      return response.data.data as Setting[];
    },
  });

  const pageData = PAGE_KEYS.reduce((acc, { key }) => {
    const setting = settings?.find((s) => s.key === key);
    let value: unknown = defaultPageContent;
    if (setting) {
      value = setting.type === 'json' && typeof setting.value !== 'string'
        ? setting.value
        : setting.value;
    }
    acc[key] = parsePageContent(value);
    return acc;
  }, {} as Record<string, PageContent>);

  useEffect(() => {
    const current = pageData[activeTab];
    if (current) {
      form.setFieldsValue({
        metaTitle: current.metaTitle ?? '',
        metaDescription: current.metaDescription ?? '',
        heroTitle: current.heroTitle ?? '',
        heroSubtitle: current.heroSubtitle ?? '',
        content: current.content ?? '',
      });
    }
  }, [activeTab, pageData, form]);

  const mutation = useMutation({
    mutationFn: async (values: PageContent) => {
      const key = activeTab;
      const existing = settings?.find((s) => s.key === key);
      const settingsPayload = [
        {
          key,
          value: JSON.stringify(values),
          type: 'json' as const,
          group: 'pages' as const,
        },
      ];
      await apiMethods.settings.update(settingsPayload);
    },
    onSuccess: () => {
      message.success('Страница сохранена');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: unknown) => {
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Ошибка сохранения';
      message.error(msg);
    },
  });

  const onFinish = (values: Record<string, string>) => {
    mutation.mutate({
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      heroTitle: values.heroTitle,
      heroSubtitle: values.heroSubtitle,
      content: values.content,
    });
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Страницы услуг</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Редактирование контента страниц: Ремонт, Дизайн, Комплектация, Мебель. Оставьте поля пустыми, чтобы на сайте отображался текст по умолчанию.
      </p>

      <Card loading={isLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={PAGE_KEYS.map(({ key, label }) => ({
            key,
            label,
            children: (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={pageData[key] || defaultPageContent}
              >
                <Form.Item name="metaTitle" label="SEO заголовок (title)">
                  <Input placeholder="Например: Ремонт квартир и домов | ETERNO STROY" />
                </Form.Item>
                <Form.Item name="metaDescription" label="SEO описание (description)">
                  <Input.TextArea rows={2} placeholder="Краткое описание для поисковиков" />
                </Form.Item>
                <Form.Item name="heroTitle" label="Заголовок на странице (H1)">
                  <Input placeholder="Например: Ремонт квартир и домов" />
                </Form.Item>
                <Form.Item name="heroSubtitle" label="Подзаголовок под H1">
                  <Input placeholder="Краткий подзаголовок в hero-блоке" />
                </Form.Item>
                <Form.Item
                  name="content"
                  label="Основной текст (HTML)"
                  extra="Можно использовать простой текст или HTML: <p>, <h2>, <h3>, <ul>, <li>, <strong>"
                >
                  <TextArea rows={14} placeholder="Введите текст или HTML-разметку страницы..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={mutation.isPending}>
                    Сохранить
                  </Button>
                </Form.Item>
              </Form>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
