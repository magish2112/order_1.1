import { Layout, Dropdown, Avatar, Space } from 'antd';
import { User, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const { Header: AntHeader } = Layout;

const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export function Header() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Профиль',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Выход',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>Панель управления</span>
        {SITE_URL && (
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 14, color: '#1890ff', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ExternalLink size={14} /> На сайт
          </a>
        )}
      </div>
      <Space>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              style={{
                backgroundColor: '#1890ff',
              }}
            >
              {user?.firstName?.[0] || 'A'}
            </Avatar>
            <span>
              {user?.firstName} {user?.lastName}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}

