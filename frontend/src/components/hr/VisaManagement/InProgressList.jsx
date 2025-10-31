import { useMemo } from 'react';
import { Card, Table, Button, Space, Typography, Input } from 'antd';
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
  searchValue = '',
  onSearchChange,
}) {
  const filteredItems = useMemo(() => {
    if (!searchValue?.trim()) return items;
    const searchLower = searchValue.toLowerCase().trim();
    return items.filter((e) => {
      const firstName = (e?.firstName || '').toLowerCase();
      const lastName = (e?.lastName || '').toLowerCase();
      const preferredName = (e?.preferredName || '').toLowerCase();
      return firstName.includes(searchLower) || lastName.includes(searchLower) || preferredName.includes(searchLower);
    });
  }, [items, searchValue]);

  const columns = useMemo(() => [
    {
      title: 'Name (Legal Full Name)',
      key: 'name',
      render: (_, r) => {
        const fullName = `${r.firstName || ''} ${r.middleName || ''} ${r.lastName || ''}`.trim();
        return fullName || r.preferredName || r.username;
      },
      ellipsis: true,
    },
    {
      title: 'Work Authorization',
      key: 'workAuth',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.workAuthorizationType || '—'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.visaStartDate ? dayjs(r.visaStartDate).format('MMM DD, YYYY') : '—'} → {r.visaEndDate ? dayjs(r.visaEndDate).format('MMM DD, YYYY') : '—'}
          </Text>
          <Text type={daysLeft(r.visaEndDate) <= 30 ? 'danger' : daysLeft(r.visaEndDate) <= 90 ? 'warning' : undefined} style={{ fontSize: 12 }}>
            {daysLeft(r.visaEndDate) !== null ? `${daysLeft(r.visaEndDate)} days remaining` : '—'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Next Steps',
      key: 'nextStep',
      render: (_, r) => (
        <Text style={{ whiteSpace: 'pre-wrap' }}>{r.nextStep || '—'}</Text>
      ),
      ellipsis: { showTitle: false },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => {
        if (r.pendingDoc) {
          return (
            <Space>
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
        if (r.nextStep && !r.nextStep.includes('Waiting for HR')) {
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
    },
  ], [onViewDocument, onSendNotification]);

  return (
    <Card
      title="In Progress - OPT Documents"
      extra={
        <Input.Search
          placeholder="Search by name..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />
      }
    >
      {filteredItems.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">
            {searchValue ? 'No employees found matching your search.' : 'No employees in progress.'}
          </Text>
        </div>
      )}
      <Table
        rowKey={(r) => r._id}
        columns={columns}
        dataSource={filteredItems}
        loading={loading}
        pagination={pagination ? {
          current: pagination.page || 1,
          pageSize: pagination.limit || 10,
          total: pagination.total || 0,
          showSizeChanger: false,
          onChange: onChangePage,
        } : false}
      />
    </Card>
  );
}

