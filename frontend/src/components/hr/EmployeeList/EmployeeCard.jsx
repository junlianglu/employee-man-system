import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Avatar, Tag, Typography, Space, Button } from 'antd';
import { UserOutlined, IdcardOutlined, MailOutlined, FileTextOutlined } from '@ant-design/icons';
import { fetchEmployeeDocuments } from '../../../features/document/documentThunks.js';
import { selectEmployeeDocuments } from '../../../features/document/documentSelectors.js';
import { BASE_URL } from '../../../api/base.js';

function initialsOf(e) {
  const f = e?.firstName?.[0] || '';
  const l = e?.lastName?.[0] || '';
  const u = e?.username?.[0] || '';
  const s = (f + l || u).toUpperCase();
  return s || 'U';
}

function statusTag(status) {
  const map = {
    approved: { color: 'green', text: 'Approved' },
    pending: { color: 'gold', text: 'Pending' },
    rejected: { color: 'red', text: 'Rejected' },
    never_submitted: { color: 'default', text: 'Never Submitted' },
  };
  const s = map[status] || { color: 'default', text: 'Unknown' };
  return <Tag color={s.color}>{s.text}</Tag>;
}

function citizenshipTag(c) {
  if (c === 'work_visa') return <Tag color="blue">Work Visa</Tag>;
  if (c === 'permanent_resident') return <Tag color="green">Permanent Resident</Tag>;
  if (c === 'citizen') return <Tag color="green">U.S. Citizen</Tag>;
  return <Tag>Unknown</Tag>;
}

export default function EmployeeCard({
  employee,
  loading = false,
  onViewProfile,
  onViewDocuments,
}) {
  const dispatch = useDispatch();
  const employeeId = employee?._id;
  const employeeDocs = useSelector((state) => (employeeId ? selectEmployeeDocuments(state, employeeId) : []));

  // Fetch employee documents when employee ID is available
  useEffect(() => {
    if (employeeId && (!employeeDocs || employeeDocs.length === 0)) {
      dispatch(fetchEmployeeDocuments(employeeId));
    }
  }, [dispatch, employeeId, employeeDocs]);

  // Get profile picture document
  const profilePictureDoc = employeeDocs?.find(d => d.type === 'profile_picture');

  // Get the full URL for the profile picture
  const getProfilePictureUrl = () => {
    if (!profilePictureDoc?._id || !profilePictureDoc?.fileUrl) return undefined;
    // If fileUrl is already a full URL, return it; otherwise prepend BASE_URL
    if (profilePictureDoc.fileUrl.startsWith('http')) {
      return profilePictureDoc.fileUrl;
    }
    return `${BASE_URL}${profilePictureDoc.fileUrl.startsWith('/') ? '' : '/'}${profilePictureDoc.fileUrl}`;
  };

  const name = employee?.preferredName || `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim();
  return (
    <Card
      size="small"
      loading={loading}
      actions={[
        <Button type="link" key="profile" onClick={() => onViewProfile?.(employee?._id)}>
          <IdcardOutlined /> Profile
        </Button>,
        <Button type="link" key="docs" onClick={() => onViewDocuments?.(employee?._id)}>
          <FileTextOutlined /> Documents
        </Button>,
      ]}
    >
      <Space align="start">
        <Avatar 
          size={48} 
          src={getProfilePictureUrl()}
          icon={!profilePictureDoc?._id ? <UserOutlined /> : null}
        >
          {!profilePictureDoc?._id ? initialsOf(employee) : null}
        </Avatar>
        <div>
          <Space wrap>
            <Typography.Text strong>{name || employee?.username}</Typography.Text>
            {employee?.isHR ? <Tag color="gold">HR</Tag> : null}
            {citizenshipTag(employee?.citizenshipStatus)}
            {employee?.workAuthorizationType ? <Tag>{employee.workAuthorizationType}</Tag> : null}
            {statusTag(employee?.onboardingReview?.status)}
          </Space>
          <div style={{ marginTop: 6 }}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">
                <MailOutlined /> {employee?.email}
              </Typography.Text>
              <Typography.Text type="secondary">
                <UserOutlined /> {employee?.username}
              </Typography.Text>
            </Space>
          </div>
        </div>
      </Space>
    </Card>
  );
}