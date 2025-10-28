import { Menu } from 'antd';
import { Link } from 'react-router-dom';

export default function NavItem({ to, label, icon, onClick, itemKey }) {
  return (
    <Menu.Item key={itemKey || to} icon={icon} onClick={onClick}>
      <Link to={to}>{label}</Link>
    </Menu.Item>
  );
}