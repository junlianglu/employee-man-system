import { Card, Space, Tag, Typography, Button, Tooltip } from 'antd';
import { EyeOutlined, DownloadOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';

function toLabel(type) {
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusColor(status) {
  switch (status) {
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'pending':
      return 'gold';
    default:
      return 'default';
  }
}

export default function DocumentStep({
  doc,
  loading = false,
  onUpload,
  onView,
  onDownload,
  required = false,
}) {
  const hasFile = !!doc?.fileUrl;
  const label = toLabel(doc?.type);
  return (
    <Card size="small" bordered style={{ marginBottom: 12 }}>
      <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space direction="vertical" size={4}>
          <Space>
            <Typography.Text strong>
              {required && (
                <Typography.Text style={{ color: '#ff4d4f', marginRight: 4 }}>*</Typography.Text>
              )}
              {label}
            </Typography.Text>
            <Tag color={statusColor(doc?.status || (hasFile ? 'pending' : 'default'))}>
              {doc?.status ? doc.status.toUpperCase() : hasFile ? 'PENDING' : 'MISSING'}
            </Tag>
          </Space>
          {doc?.hrFeedback ? (
            <Typography.Text type="secondary">
              <InfoCircleOutlined /> {doc.hrFeedback}
            </Typography.Text>
          ) : null}
          {doc?.reviewedAt ? (
            <Typography.Text type="secondary">
              Reviewed: {new Date(doc.reviewedAt).toLocaleString()}
            </Typography.Text>
          ) : null}
          {doc?.fileName ? (
            <Typography.Text type="secondary">File: {doc.fileName}</Typography.Text>
          ) : null}
        </Space>

        <Space>
          {hasFile && (
            <>
              <Tooltip title="View">
                <Button icon={<EyeOutlined />} onClick={onView} />
              </Tooltip>
              <Tooltip title="Download">
                <Button icon={<DownloadOutlined />} onClick={onDownload} />
              </Tooltip>
            </>
          )}
          <Button type="primary" icon={<UploadOutlined />} onClick={onUpload} loading={loading}>
            {hasFile ? 'Replace' : 'Upload'}
          </Button>
        </Space>
      </Space>
    </Card>
  );
}