import { useState } from 'react';
import { Modal, Input, Button, Space, message } from 'antd';

interface UrlInputModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

/**
 * Валидация URL
 */
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Разрешаем относительные URL
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }

  // Проверяем абсолютные URL
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function UrlInputModal({
  visible,
  title,
  placeholder = 'Введите URL',
  onConfirm,
  onCancel,
}: UrlInputModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      setError('URL не может быть пустым');
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Некорректный URL. Используйте http://, https:// или относительный путь');
      return;
    }

    setError('');
    onConfirm(trimmedUrl);
    setUrl('');
  };

  const handleCancel = () => {
    setUrl('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Отмена
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          Добавить
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input
          placeholder={placeholder}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          onPressEnter={handleConfirm}
          status={error ? 'error' : ''}
        />
        {error && <div style={{ color: '#ff4d4f', fontSize: '12px' }}>{error}</div>}
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
          Примеры: https://example.com/image.jpg, /images/photo.png
        </div>
      </Space>
    </Modal>
  );
}

