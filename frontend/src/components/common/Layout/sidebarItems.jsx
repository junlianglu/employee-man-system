import React from 'react';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';

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

