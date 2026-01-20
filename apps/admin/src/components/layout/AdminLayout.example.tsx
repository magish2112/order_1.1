// ПРИМЕР: Как интегрировать EnhancedSidebar
// Этот файл показывает, как заменить обычный Sidebar на EnhancedSidebar

import { ReactNode } from 'react';
import { Layout } from 'antd';
// import { Sidebar } from './Sidebar'; // Старый вариант
import { EnhancedSidebar } from './EnhancedSidebar'; // Новый улучшенный вариант
import { Header } from './Header';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

const { Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { sidebarWidth } = useSidebar();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Замените Sidebar на EnhancedSidebar */}
      <EnhancedSidebar />
      
      <Layout 
        style={{ 
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.2s'
        }}
      >
        <Header />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}



