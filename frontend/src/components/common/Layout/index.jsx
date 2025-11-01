import React, { useState, useMemo } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import { getDefaultSidebarItems } from './sidebarItems.jsx';

const { Content } = Layout;

export default function AppLayout({
  username,
  role,
  onLogout,
  isHR = false,
  sidebarItems,
  headerTitle,
  children,
  contentStyle,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const items = useMemo(() => sidebarItems || getDefaultSidebarItems({ isHR }), [sidebarItems, isHR]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        items={items}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />
      <Layout>
        <Header
          title={headerTitle || (isHR ? 'HR Portal' : 'Employee Portal')}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          username={username}
          role={role}
          onLogout={onLogout}
        />
        <Content style={{ margin: 16 }}>
          <div
            style={{
              padding: 16,
              background: '#fff',
              borderRadius: 8,
              minHeight: 'calc(100vh - 160px)',
              ...contentStyle,
            }}
          >
            {children ?? <Outlet />}
          </div>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
}