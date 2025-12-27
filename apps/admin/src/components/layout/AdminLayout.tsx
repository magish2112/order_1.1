import { ReactNode } from 'react';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar';
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
      <Sidebar />
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

