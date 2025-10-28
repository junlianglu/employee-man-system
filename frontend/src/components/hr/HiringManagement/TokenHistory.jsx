import { Card, Table, Tag, Space, Button, Typography } from 'antd';
import { ReloadOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';

function statusTag(row) {
  if (row.submittedAt) return <Tag color="green">Used</Tag>;
  const expired = row.expiresAt && new Date(row.expiresAt) < new Date();
  return <Tag color={expired ? 'red' : 'blue'}>{expired ? 'Expired' : 'Active'}</Tag>;
}

export default function TokenHistory({
  tokens = [],
  loading = false,
  onRefresh,
}) {
  const columns = [
    {
      title: 'Candidate',
      key: 'name',
      render: (_, r) => (
        <span>{r.firstName} {r.middleName ? `${r.middleName} ` : ''}{r.lastName}</span>
      ),
      ellipsis: true,
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    {
      title: 'Token',
      key: 'token',
      render: (_, r) => (
        <Space>
          <Typography.Text code ellipsis style={{ maxWidth: 160, display: 'inline-block' }}>
            {r.token}
          </Typography.Text>
          <Button size="small" icon={<CopyOutlined />} onClick={() => navigator.clipboard.writeText(r.token)}>
            Copy
          </Button>
        </Space>
      ),
    },
    {
      title: 'Link',
      key: 'link',
      render: (_, r) => (
        <Space>
          <Typography.Link href={r.registrationLink} target="_blank">
            <LinkOutlined /> Open
          </Typography.Link>
          <Button size="small" icon={<CopyOutlined />} onClick={() => navigator.clipboard.writeText(r.registrationLink)}>
            Copy
          </Button>
        </Space>
      ),
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { title: 'Status', key: 'status', render: (_, r) => statusTag(r) },
  ];

  return (
    <Card
      title="Token History"
      extra={
        <Button icon={<ReloadOutlined />} onClick={onRefresh} disabled={loading} loading={loading}>
          Refresh
        </Button>
      }
    >
      <Table
        rowKey={(r) => r._id || `${r.email}-${r.token}`}
        columns={columns}
        dataSource={tokens}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}