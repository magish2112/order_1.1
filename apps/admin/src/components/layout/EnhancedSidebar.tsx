import { useState, useMemo, useEffect } from 'react';
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space } from 'antd';
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
  Search,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiMethods } from '../../lib/api';

const { Sider } = Layout;
const { Search: AntSearch } = Input;

// Группировка меню
interface MenuGroup {
  key: string;
  label: string;
  items: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    badge?: number | string;
    children?: Array<{ key: string; label: string }>;
  }>;
}

const menuGroups: MenuGroup[] = [
  {
    key: 'main',
    label: 'Основное',
    items: [
      {
        key: '/dashboard',
        icon: <LayoutDashboard size={20} />,
        label: 'Dashboard',
      },
    ],
  },
  {
    key: 'content',
    label: 'Контент',
    items: [
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
    ],
  },
  {
    key: 'management',
    label: 'Управление',
    items: [
      {
        key: '/requests',
        icon: <MessageSquare size={20} />,
        label: 'Заявки',
        // badge будет добавлен динамически
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
    ],
  },
  {
    key: 'system',
    label: 'Система',
    items: [
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
    ],
  },
];

export function EnhancedSidebar() {
  const { collapsed, setCollapsed, sidebarWidth } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Получаем количество новых заявок
  const { data: newRequestsCount } = useQuery({
    queryKey: ['requests', 'new-count'],
    queryFn: async () => {
      try {
        const response = await apiMethods.requests.list({ status: 'NEW' });
        return (response.data.data as any[]).length || 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Фильтрация меню по поиску
  const filteredMenuGroups = useMemo(() => {
    if (!searchText.trim()) {
      return menuGroups;
    }

    const query = searchText.toLowerCase();
    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.children?.some((child) =>
              child.label.toLowerCase().includes(query)
            )
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchText]);

  // Преобразование в формат Ant Design Menu
  const menuItems = useMemo(() => {
    return filteredMenuGroups.flatMap((group) => {
      const items = group.items.map((item) => {
        const menuItem: any = {
          key: item.key,
          icon: item.icon,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>{item.label}</span>
              {item.key === '/requests' && newRequestsCount && newRequestsCount > 0 && (
                <Badge
                  count={newRequestsCount}
                  size="small"
                  style={{
                    backgroundColor: '#ff4d4f',
                    marginLeft: 8,
                  }}
                />
              )}
            </div>
          ),
        };

        if (item.children) {
          menuItem.children = item.children.map((child) => ({
            key: child.key,
            label: child.label,
          }));
        }

        return menuItem;
      });

      // Добавляем разделитель между группами (кроме первой)
      if (group.key !== 'main') {
        return [{ type: 'divider' as const }, ...items];
      }
      return items;
    });
  }, [filteredMenuGroups, newRequestsCount]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const userMenuItems = [
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

  // Определяем активный ключ (учитывая вложенные маршруты)
  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    // Проверяем точное совпадение или начало пути
    const exactMatch = menuItems.find((item) => item.key === path);
    if (exactMatch) return [path];

    // Проверяем вложенные маршруты
    for (const item of menuItems) {
      if (item.children) {
        const childMatch = item.children.find((child: { key: string }) => child.key === path);
        if (childMatch) {
          return [item.key, childMatch.key];
        }
        // Проверяем, начинается ли путь с родительского ключа
        if (path.startsWith(item.key)) {
          return [item.key];
        }
      }
    }
    return [];
  }, [location.pathname, menuItems]);

  const openKeys = useMemo(() => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.children) {
        const childMatch = item.children.find((child: { key: string }) => child.key === path);
        if (childMatch) {
          return [item.key];
        }
      }
    }
    return [];
  }, [location.pathname, menuItems]);

  const sidebarContent = (
    <>
      {/* Логотип/Заголовок */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s',
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#fff',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #e1b869 0%, #d4a556 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#17271C',
                fontWeight: 'bold',
              }}
            >
              А
            </div>
            <span>Админ-панель</span>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #e1b869 0%, #d4a556 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#17271C',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            А
          </div>
        )}
      </div>

      {/* Поиск */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <AntSearch
            placeholder="Поиск в меню..."
            prefix={<Search size={16} style={{ color: 'rgba(255, 255, 255, 0.45)' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            styles={{
              input: {
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
              },
            }}
          />
        </div>
      )}

      {/* Меню */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          flex: 1,
          overflow: 'auto',
        }}
      />

      {/* Профиль пользователя */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 16px',
        }}
      >
        {collapsed ? (
          <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
            <Avatar
              style={{
                backgroundColor: '#e1b869',
                color: '#17271C',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              {user?.firstName?.[0] || 'A'}
            </Avatar>
          </Dropdown>
        ) : (
          <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: 6,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Avatar
                style={{
                  backgroundColor: '#e1b869',
                  color: '#17271C',
                }}
              >
                {user?.firstName?.[0] || 'A'}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </div>
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>
          </Dropdown>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #17271C 0%, #1a2f20 100%)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        }}
        theme="dark"
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Menu Button */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1001,
        }}
        className="mobile-menu-button"
      >
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            background: '#17271C',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: 280,
              background: 'linear-gradient(180deg, #17271C 0%, #1a2f20 100%)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {sidebarContent}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block !important;
          }
          .ant-layout-sider {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-button {
            display: none !important;
          }
        }
        
        /* Кастомные стили для меню */
        .ant-menu-dark {
          background: transparent !important;
        }
        .ant-menu-dark .ant-menu-item-selected {
          background-color: rgba(225, 184, 105, 0.2) !important;
          color: #e1b869 !important;
        }
        .ant-menu-dark .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ant-menu-dark .ant-menu-submenu-title:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ant-menu-dark .ant-menu-item-active {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </>
  );
}

