import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Switch, Button, Card, Space, message, Select, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { apiMethods } from '../../lib/api';
import { Vacancy } from '../../lib/types';

const { TextArea } = Input;

export function VacancyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';
  const [requirements, setRequirements] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  const { data: vacancy, isLoading } = useQuery({
    queryKey: ['vacancy', id],
    queryFn: async () => {
      const response = await apiMethods.vacancies.get(id!);
      return response.data.data as Vacancy;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (vacancy && !isNew) {
      form.setFieldsValue(vacancy);
      setRequirements(vacancy.requirements || []);
      setResponsibilities(vacancy.responsibilities || []);
      setConditions(vacancy.conditions || []);
    }
  }, [vacancy, form, isNew]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const data = {
        ...values,
        requirements,
        responsibilities,
        conditions,
      };
      if (isNew) {
        await apiMethods.vacancies.create(data);
      } else {
        await apiMethods.vacancies.update(id!, data);
      }
    },
    onSuccess: () => {
      message.success(isNew ? 'Вакансия создана' : 'Вакансия обновлена');
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      navigate('/vacancies');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  const addItem = (list: string[], setList: (items: string[]) => void) => {
    const newItem = prompt('Введите пункт:');
    if (newItem) {
      setList([...list, newItem]);
    }
  };

  const removeItem = (index: number, list: string[], setList: (items: string[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vacancies')}>
          Назад
        </Button>
        <h1>{isNew ? 'Создать вакансию' : 'Редактировать вакансию'}</h1>
      </Space>

      <Card loading={isLoading && !isNew}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
          }}
        >
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Название вакансии" />
          </Form.Item>

          <Form.Item name="department" label="Отдел">
            <Input placeholder="Отдел" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <TextArea rows={6} placeholder="Описание вакансии" />
          </Form.Item>

          <Form.Item label="Требования">
            <Space direction="vertical" style={{ width: '100%' }}>
              {requirements.map((req, index) => (
                <Space key={index} style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Input value={req} readOnly />
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removeItem(index, requirements, setRequirements)}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addItem(requirements, setRequirements)}
                style={{ width: '100%' }}
              >
                Добавить требование
              </Button>
            </Space>
          </Form.Item>

          <Form.Item label="Обязанности">
            <Space direction="vertical" style={{ width: '100%' }}>
              {responsibilities.map((resp, index) => (
                <Space key={index} style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Input value={resp} readOnly />
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removeItem(index, responsibilities, setResponsibilities)}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addItem(responsibilities, setResponsibilities)}
                style={{ width: '100%' }}
              >
                Добавить обязанность
              </Button>
            </Space>
          </Form.Item>

          <Form.Item label="Условия">
            <Space direction="vertical" style={{ width: '100%' }}>
              {conditions.map((cond, index) => (
                <Space key={index} style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Input value={cond} readOnly />
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removeItem(index, conditions, setConditions)}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addItem(conditions, setConditions)}
                style={{ width: '100%' }}
              >
                Добавить условие
              </Button>
            </Space>
          </Form.Item>

          <Space>
            <Form.Item name="salaryFrom" label="Зарплата от (₽)">
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="salaryTo" label="Зарплата до (₽)">
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Form.Item name="experience" label="Опыт">
            <Input placeholder="1-3 года, без опыта и т.д." />
          </Form.Item>

          <Form.Item name="employment" label="Тип занятости">
            <Select placeholder="Выберите тип">
              <Select.Option value="полная занятость">Полная занятость</Select.Option>
              <Select.Option value="частичная занятость">Частичная занятость</Select.Option>
              <Select.Option value="удаленная работа">Удаленная работа</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Активна">
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
