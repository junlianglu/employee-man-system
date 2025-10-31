import { useMemo } from 'react';
import { Card, Table, Button, Space, Typography } from 'antd';
import { EyeOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

function daysLeft(visaEndDate) {
  if (!visaEndDate) return null;
  return dayjs(visaEndDate).diff(dayjs(), 'day');
}

export default function InProgressList({
  items = [],
  loading = false,
  pagination,
  onChangePage,
  onViewDocument,
  onSendNotification,
}) {

  const columns = useMemo(() => [
    {
      title: 'Name (Legal Full Name)',
      key: 'name',
      render: (_, r) => {
        const fullName = `${r.firstName || ''} ${r.middleName || ''} ${r.lastName || ''}`.trim();
        return fullName || r.preferredName || r.username;
      },
      ellipsis: true,
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Work Authorization',
      key: 'workAuth',
      render: (_, r) => {
        // If this is a registration token or employee hasn't submitted onboarding yet
        if (r.isToken || !r.workAuthorizationType) {
          return <Text type="secondary">Not yet determined</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{r.workAuthorizationType || '—'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.visaStartDate ? dayjs(r.visaStartDate).format('MMM DD, YYYY') : '—'} → {r.visaEndDate ? dayjs(r.visaEndDate).format('MMM DD, YYYY') : '—'}
            </Text>
            <Text type={daysLeft(r.visaEndDate) <= 30 ? 'danger' : daysLeft(r.visaEndDate) <= 90 ? 'warning' : undefined} style={{ fontSize: 12 }}>
              {daysLeft(r.visaEndDate) !== null ? `${daysLeft(r.visaEndDate)} days remaining` : '—'}
            </Text>
          </Space>
        );
      },
      width: 200,
    },
    {
      title: 'Next Steps',
      key: 'nextStep',
      render: (_, r) => (
        <Text style={{ whiteSpace: 'pre-wrap' }}>{r.nextStep || '—'}</Text>
      ),
      ellipsis: { showTitle: false },
      width: 250,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => {
        // Registration tokens or employees without _id (edge case)
        if (r.isToken || !r._id) {
          return (
            <Button
              size="small"
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                // For tokens, we might need to handle differently
                // For now, only enable if we have an email-based ID
                if (r.email) {
                  // Note: This might need backend support for token-based notifications
                  // For now, disable the button or show a message
                  console.warn('Notification not yet supported for registration tokens');
                }
              }}
              disabled={r.isToken} // Disable for tokens until backend supports it
            >
              Send Notification
            </Button>
          );
        }
        
        if (r.pendingDoc) {
          return (
            <Space size="small" wrap>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onViewDocument?.(r._id, r.pendingDoc._id)}
              >
                Preview & Review
              </Button>
            </Space>
          );
        }
        
        // Don't show Send Notification if waiting for HR (onboarding or document review)
        if (r.nextStep && 
            (r.nextStep.includes('Waiting for HR') || 
             r.nextStep.includes('Wait for HR'))) {
          return <Text type="secondary">No action needed</Text>;
        }
        
        // Show Send Notification for other cases (employee needs to take action)
        if (r.nextStep) {
          return (
            <Button
              size="small"
              type="primary"
              icon={<SendOutlined />}
              onClick={() => onSendNotification?.(r._id)}
            >
              Send Notification
            </Button>
          );
        }
        
        return <Text type="secondary">No action needed</Text>;
      },
      width: 180,
    },
  ], [onViewDocument, onSendNotification]);

  return (
    <Card title="In Progress - OPT Documents">
      {items.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">No employees in progress.</Text>
        </div>
      )}
      <Table
        rowKey={(r) => r._id || `token-${r.email}`}
        columns={columns}
        dataSource={items}
          loading={loading}
          pagination={pagination ? {
            current: pagination.page || 1,
            pageSize: pagination.limit || 10,
            total: pagination.total || 0,
            showSizeChanger: false,
            onChange: onChangePage,
          } : false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
    </Card>
  );
}

