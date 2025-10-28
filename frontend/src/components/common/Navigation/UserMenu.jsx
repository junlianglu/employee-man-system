import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Avatar, Space, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../../features/auth/authThunks.js';
import { selectCurrentUser, selectIsHR } from '../../../features/auth/authSelectors.js';

export default function UserMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isHR = useSelector(selectIsHR);

  const initials = useMemo(() => {
    const fn = user?.firstName?.[0] || user?.username?.[0] || 'U';
    const ln = user?.lastName?.[0] || '';
    return (fn + ln).toUpperCase();
  }, [user]);

  const items = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: <Link to="/employee/personal-info">Profile</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: async () => {
        await dispatch(logout());
        navigate('/auth/login');
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Space style={{ cursor: 'pointer' }}>
        <Avatar style={{ backgroundColor: '#1677ff' }} icon={!user ? <UserOutlined /> : null}>
          {user ? initials : null}
        </Avatar>
        {user?.username}
        {isHR ? <Tag color="gold">HR</Tag> : null}
      </Space>
    </Dropdown>
  );
}