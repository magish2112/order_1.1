import { useEffect, useRef } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [form] = Form.useForm();
  const autoLoginTriggered = useRef(false);

  const onFinish = (values: { email: string; password: string }) => {
    login(values);
  };

  useEffect(() => {
    if (!import.meta.env.DEV || autoLoginTriggered.current) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('devLogin') === '1') {
      autoLoginTriggered.current = true;
      login({ email: 'admin@example.com', password: 'admin123' });
    }
  }, [login]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            Админ-панель
          </h1>
          <p style={{ color: '#666' }}>Войдите в систему</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input
              prefix={<Mail size={16} />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="Пароль"
              autoComplete="current-password"
            />
          </Form.Item>

          {loginError && (
            <div style={{ color: '#ff4d4f', marginBottom: 16, textAlign: 'center' }}>
              Неверный email или пароль
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoggingIn}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

