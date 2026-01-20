import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Switch, Button, Card, Space, message, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { apiMethods } from '../../lib/api';
import { Faq } from '../../lib/types';

const { TextArea } = Input;

export function FaqEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';

  const { data: faq, isLoading } = useQuery({
    queryKey: ['faq', id],
    queryFn: async () => {
      const response = await apiMethods.faqs.get(id!);
      return response.data.data as Faq;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (faq && !isNew) {
      form.setFieldsValue(faq);
    }
  }, [faq, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (isNew) {
        await apiMethods.faqs.create(values);
      } else {
        await apiMethods.faqs.update(id!, values);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'FAQ создан' : 'FAQ обновлен');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      navigate('/faq');
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/faq')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать FAQ' : 'Редактировать FAQ'}</h1>
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
            name="question"
            label="Вопрос"
            rules={[{ required: true, message: 'Введите вопрос' }]}
          >
            <Input placeholder="Вопрос" />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Ответ"
            rules={[{ required: true, message: 'Введите ответ' }]}
          >
            <TextArea rows={6} placeholder="Ответ" />
          </Form.Item>

          <Form.Item name="category" label="Категория">
            <Input placeholder="Категория (необязательно)" />
          </Form.Item>

          <Form.Item name="order" label="Порядок сортировки">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Активен">
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
