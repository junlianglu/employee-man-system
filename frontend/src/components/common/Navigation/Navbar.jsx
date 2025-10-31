import { Layout, Menu } from 'antd';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DashboardOutlined,
  IdcardOutlined,
  TeamOutlined,
  AuditOutlined,
  SolutionOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import NavItem from './NavItem.jsx';
import UserMenu from './UserMenu.jsx';
import { selectIsAuthenticated, selectIsHR } from '../../../features/auth/authSelectors.js';
import { selectOnboardingStatusData } from '../../../features/employee/employeeSelectors.js';

const { Header } = Layout;

function useActiveKey() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/hr/visa')) return '/hr/visa';
  if (pathname.startsWith('/hr/hiring')) return '/hr/hiring';
  if (pathname.startsWith('/hr/employees')) return '/hr/employees';
  if (pathname.startsWith('/employee/personal-info')) return '/employee/personal-info';
  if (pathname.startsWith('/employee/visa-status')) return '/employee/visa-status';
  if (pathname.startsWith('/employee/documents')) return '/employee/documents';
  if (pathname.startsWith('/employee')) return '/employee';
  if (pathname.startsWith('/hr')) return '/hr';
  return '/';
}

export default function Navbar() {
  const isAuthed = useSelector(selectIsAuthenticated);
  const isHR = useSelector(selectIsHR);
  const onboardingData = useSelector(selectOnboardingStatusData);
  const activeKey = useActiveKey();

  // Check if employee's onboarding is approved
  const isOnboardingApproved = isHR || onboardingData?.status === 'approved';

  const leftItems = isHR
    ? [
        { to: '/hr', label: 'HR Dashboard', icon: <DashboardOutlined /> },
        { to: '/hr/hiring', label: 'Hiring', icon: <SolutionOutlined /> },
        { to: '/hr/employees', label: 'Employees', icon: <TeamOutlined /> },
        { to: '/hr/visa', label: 'Visa Mgmt', icon: <AuditOutlined /> },
      ]
    : isOnboardingApproved
    ? [
        { to: '/employee', label: 'Dashboard', icon: <DashboardOutlined /> },
        { to: '/employee/personal-info', label: 'Personal Info', icon: <IdcardOutlined /> },
        { to: '/employee/visa-status', label: 'Visa Status', icon: <ApartmentOutlined /> },
      ]
    : []; // Hide all navigation links if onboarding is not approved

  return (
    <Header style={{ display: 'flex', alignItems: 'center', paddingInline: 16 }}>
      <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>Employee System</div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[activeKey]}
        style={{ flex: 1, minWidth: 0 }}
      >
        {isAuthed &&
          leftItems.map((it) => (
            <NavItem key={it.to} itemKey={it.to} to={it.to} label={it.label} icon={it.icon} />
          ))}
      </Menu>
      {isAuthed ? <UserMenu /> : null}
    </Header>
  );
}