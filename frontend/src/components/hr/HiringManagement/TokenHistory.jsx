import { Card, Table, Tag, Space, Button, Typography } from 'antd';
import { ReloadOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import './TokenHistory.css';

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
      width: 140,
      fixed: 'left',
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email', 
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Token',
      key: 'token',
      render: (_, r) => (
        <Space size="small" wrap>
          <Typography.Text code ellipsis style={{ maxWidth: 100, display: 'inline-block' }}>
            {r.token}
          </Typography.Text>
          <Button 
            size="small" 
            icon={<CopyOutlined />} 
            onClick={() => navigator.clipboard.writeText(r.token)}
            title="Copy token"
          >
            Copy
          </Button>
        </Space>
      ),
      width: 160,
    },
    {
      title: 'Link',
      key: 'link',
      render: (_, r) => (
        <Space size="small" wrap>
          <Typography.Link href={r.registrationLink} target="_blank">
            <LinkOutlined /> Open
          </Typography.Link>
          <Button 
            size="small" 
            icon={<CopyOutlined />} 
            onClick={() => navigator.clipboard.writeText(r.registrationLink)}
            title="Copy link"
          >
            Copy
          </Button>
        </Space>
      ),
      width: 140,
    },
    { 
      title: 'Created', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (v) => v ? new Date(v).toLocaleString() : '—',
      width: 160,
    },
    { 
      title: 'Expires', 
      dataIndex: 'expiresAt', 
      key: 'expiresAt', 
      render: (v) => v ? new Date(v).toLocaleString() : '—',
      width: 160,
    },
    { 
      title: 'Submitted', 
      dataIndex: 'submittedAt', 
      key: 'submittedAt', 
      render: (v) => v ? new Date(v).toLocaleString() : '—',
      width: 160,
    },
    { 
      title: 'Status', 
      key: 'status', 
      render: (_, r) => statusTag(r),
      width: 100,
    },
  ];

  return (
    <Card
      title="Token History"
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh} 
          disabled={loading} 
          loading={loading}
          size="small"
        >
          <span className="responsive-button-text">Refresh</span>
        </Button>
      }
      className="token-history-card"
    >
      <div className="token-history-table-wrapper">
        <Table
          rowKey={(r) => r._id || `${r.email}-${r.token}`}
          columns={columns}
          dataSource={tokens}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </div>
    </Card>
  );
}