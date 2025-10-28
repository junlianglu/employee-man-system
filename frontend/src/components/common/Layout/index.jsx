import React, { useState, useMemo } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';

import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';

const { Content } = Layout;

export function getDefaultSidebarItems({ isHR } = {}) {
  if (isHR) {
    return [
      { key: '/hr/dashboard', icon: <DashboardOutlined />, label: 'HR Dashboard', path: '/hr/dashboard' },
      { key: '/hr/hiring', icon: <TeamOutlined />, label: 'Hiring', path: '/hr/hiring' },
      { key: '/hr/employees', icon: <UserOutlined />, label: 'Employees', path: '/hr/employees' },
      { key: '/hr/visa-status', icon: <AuditOutlined />, label: 'Visa Status', path: '/hr/visa-status' },
      { key: '/hr/documents', icon: <FileTextOutlined />, label: 'Documents', path: '/hr/documents' },
    ];
  }
  return [
    { key: '/employee/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', path: '/employee/dashboard' },
    { key: '/employee/personal-info', icon: <UserOutlined />, label: 'Personal Info', path: '/employee/personal-info' },
    { key: '/employee/onboarding', icon: <TeamOutlined />, label: 'Onboarding', path: '/employee/onboarding' },
    { key: '/employee/visa-status', icon: <AuditOutlined />, label: 'Visa Status', path: '/employee/visa-status' },
    { key: '/employee/documents', icon: <FileTextOutlined />, label: 'Documents', path: '/employee/documents' },
  ];
}

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