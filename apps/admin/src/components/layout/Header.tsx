import { Layout, Dropdown, Avatar, Space } from 'antd';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const { Header: AntHeader } = Layout;

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
        marginLeft: 250, // Отступ для Sidebar (будет динамическим)
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 500 }}>Панель управления</div>
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

