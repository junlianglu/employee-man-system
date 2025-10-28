import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

export default function Sidebar({
  items = [],
  collapsed,
  onCollapse,
  width = 220,
  style,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = useMemo(() => {
    const match = items
      .flatMap((i) => (i.children ? i.children : i))
      .filter(Boolean)
      .find((i) => i.path && location.pathname.startsWith(i.path));
    return [match?.key || location.pathname];
  }, [items, location.pathname]);

  const handleClick = ({ key, keyPath, item }) => {
    const path = item?.props?.path || item?.path;
    if (path) navigate(path);
  };

  const menuItems = items.map((i) =>
    i.children
      ? {
          key: i.key,
          icon: i.icon,
          label: i.label,
          children: i.children.map((c) => ({
            key: c.key,
            icon: c.icon,
            label: c.label,
            path: c.path,
          })),
        }
      : { key: i.key, icon: i.icon, label: i.label, path: i.path }
  );

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={width}
      breakpoint="lg"
      style={{ background: '#fff', ...style }}
    >
      <div
        style={{
          height: 48,
          margin: 12,
          borderRadius: 8,
          background: 'rgba(0,0,0,0.06)',
        }}
      />
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={handleClick}
      />
    </Sider>
  );
}