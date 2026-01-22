import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  FileText,
  MessageSquare,
  Users,
  UserCog,
  Star,
  Briefcase,
  HelpCircle,
  Image,
  Settings,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../hooks/useAuth';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
  },
  {
    key: '/services/list',
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
    key: '/users',
    icon: <UserCog size={20} />,
    label: 'Пользователи',
  },
  {
    key: '/settings',
    icon: <Settings size={20} />,
    label: 'Настройки',
  },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Проверяем права доступа для управления пользователями
  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  // Формируем меню с учетом прав доступа
  const menuItemsWithPermissions = menuItems.filter((item) => {
    // Скрываем пункт "Пользователи" для тех, у кого нет прав
    if (item.key === '/users' && !canManageUsers) {
      return false;
    }
    return true;
  });

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
        items={menuItemsWithPermissions}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}

