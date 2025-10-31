import { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Avatar, Space, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../../features/auth/authThunks.js';
import { selectCurrentUser, selectIsHR } from '../../../features/auth/authSelectors.js';
import { fetchMyDocuments } from '../../../features/document/documentThunks.js';
import { selectMyDocuments } from '../../../features/document/documentSelectors.js';
import { BASE_URL } from '../../../api/base.js';

export default function UserMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isHR = useSelector(selectIsHR);
  const documents = useSelector(selectMyDocuments);

  // Fetch documents if user is logged in and not HR (HR doesn't have profile pictures)
  useEffect(() => {
    if (user && !isHR) {
      dispatch(fetchMyDocuments());
    }
  }, [dispatch, user, isHR]);

  const initials = useMemo(() => {
    const fn = user?.firstName?.[0] || user?.username?.[0] || 'U';
    const ln = user?.lastName?.[0] || '';
    return (fn + ln).toUpperCase();
  }, [user]);

  // Get profile picture document
  const profilePictureDoc = documents?.find(d => d.type === 'profile_picture');

  // Get the full URL for the profile picture
  const getProfilePictureUrl = () => {
    if (!profilePictureDoc?._id || !profilePictureDoc?.fileUrl) return undefined;
    // If fileUrl is already a full URL, return it; otherwise prepend BASE_URL
    if (profilePictureDoc.fileUrl.startsWith('http')) {
      return profilePictureDoc.fileUrl;
    }
    return `${BASE_URL}${profilePictureDoc.fileUrl.startsWith('/') ? '' : '/'}${profilePictureDoc.fileUrl}`;
  };

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
      <Space style={{ cursor: 'pointer', color: '#fff' }}>
        <Avatar 
          src={user && !isHR ? getProfilePictureUrl() : undefined}
          style={{ backgroundColor: '#1677ff' }} 
          icon={!user ? <UserOutlined /> : (!profilePictureDoc?._id ? <UserOutlined /> : null)}
        >
          {user && (!profilePictureDoc?._id || isHR) ? initials : null}
        </Avatar>
        <span style={{ color: '#fff' }}>{user?.username}</span>
        {isHR ? <Tag color="gold">HR</Tag> : null}
      </Space>
    </Dropdown>
  );
}