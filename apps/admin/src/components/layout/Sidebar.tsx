import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  FileText,
  MessageSquare,
  Users,
  Star,
  Briefcase,
  HelpCircle,
  Image,
  Settings,
} from 'lucide-react';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
  },
  {
    key: '/services',
    icon: <Wrench size={20} />,
    label: 'Услуги',
    children: [
      { key: '/services/categories', label: 'Категории' },
      { key: '/services/list', label: 'Список услуг' },
    ],
  },
  {
    key: '/projects',
    icon: <FolderKanban size={20} />,
    label: 'Проекты',
  },
  {
    key: '/articles',
    icon: <FileText size={20} />,
    label: 'Статьи',
  },
  {
    key: '/requests',
    icon: <MessageSquare size={20} />,
    label: 'Заявки',
  },
  {
    key: '/employees',
    icon: <Users size={20} />,
    label: 'Сотрудники',
  },
  {
    key: '/reviews',
    icon: <Star size={20} />,
    label: 'Отзывы',
  },
  {
    key: '/vacancies',
    icon: <Briefcase size={20} />,
    label: 'Вакансии',
  },
  {
    key: '/faq',
    icon: <HelpCircle size={20} />,
    label: 'FAQ',
  },
  {
    key: '/media',
    icon: <Image size={20} />,
    label: 'Медиатека',
  },
  {
    key: '/settings',
    icon: <Settings size={20} />,
    label: 'Настройки',
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
        }}
      >
        {collapsed ? 'А' : 'Админ-панель'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}

