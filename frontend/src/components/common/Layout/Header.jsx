import React from 'react';
import { Layout, Space, Typography, Button, Dropdown, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

export default function Header({
  title = 'Employee Management System',
  collapsed,
  onToggleSidebar,
  username,
  role,
  onLogout,
  extra,
  style,
}) {
  const items = [
    { key: 'profile', label: <span>Profile</span>, icon: <UserOutlined /> },
    ...(onLogout
      ? [{ type: 'divider' }, { key: 'logout', label: 'Logout', icon: <LogoutOutlined /> }]
      : []),
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout' && onLogout) onLogout();
  };

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <Space align="center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
        />
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
      </Space>

      <Space align="center">
        {extra}
        <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text>
              {username || 'User'}
              {role ? ` (${role})` : ''}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}