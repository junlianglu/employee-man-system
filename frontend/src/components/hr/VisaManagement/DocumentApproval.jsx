import { useState, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Tooltip } from 'antd';
import { EyeOutlined, DownloadOutlined, CheckOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import FeedbackModal from '../../common/Modals/FeedbackModal.jsx';
import './DocumentApproval.css';

function statusTag(status) {
  if (status === 'approved') return <Tag color="green">Approved</Tag>;
  if (status === 'rejected') return <Tag color="red">Rejected</Tag>;
  if (status === 'pending') return <Tag color="gold">Pending</Tag>;
  return <Tag>—</Tag>;
}

export default function DocumentApproval({
  documents = [],
  loading = false,
  onView,
  onDownload,
  onApprove,
  onReject,
}) {
  const [modal, setModal] = useState({ open: false, docId: null, initialStatus: 'approved' });

  const columns = useMemo(() => [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (v) => (v || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      width: 120,
    },
    { 
      title: 'File', 
      dataIndex: 'fileName', 
      key: 'fileName', 
      render: (v) => v || '—',
      width: 150,
      ellipsis: true,
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (v) => statusTag(v),
      width: 100,
    },
    {
      title: 'Feedback',
      dataIndex: 'hrFeedback',
      key: 'hrFeedback',
      render: (v) => v ? (
        <Tooltip title={v}>
          <span><InfoCircleOutlined /> {v}</span>
        </Tooltip>
      ) : '—',
      ellipsis: true,
      width: 200,
    },
    { 
      title: 'Reviewed At', 
      dataIndex: 'reviewedAt', 
      key: 'reviewedAt', 
      render: (v) => v ? new Date(v).toLocaleString() : '—',
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Space size="small" wrap>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => onView?.(r._id)} />
          </Tooltip>
          <Tooltip title="Download">
            <Button size="small" icon={<DownloadOutlined />} onClick={() => onDownload?.(r._id)} />
          </Tooltip>
          <Button 
            size="small"
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={() => setModal({ open: true, docId: r._id, initialStatus: 'approved' })}
          >
            Approve
          </Button>
          <Button 
            size="small"
            danger 
            icon={<CloseOutlined />} 
            onClick={() => setModal({ open: true, docId: r._id, initialStatus: 'rejected' })}
          >
            Reject
          </Button>
        </Space>
      ),
      width: 250,
    },
  ], [onView, onDownload]);

  return (
    <>
      <Card title="Pending Document Reviews" className="document-approval-card">
        <div style={{ overflowX: 'auto' }}>
          <Table
            rowKey={(r) => r._id}
            columns={columns}
            dataSource={documents}
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        </div>
      </Card>

      <FeedbackModal
        open={modal.open}
        initialStatus={modal.initialStatus}
        submitting={false}
        onSubmit={async ({ status, hrFeedback }) => {
          if (status === 'approved') await onApprove?.({ docId: modal.docId, hrFeedback });
          else await onReject?.({ docId: modal.docId, hrFeedback });
          setModal({ open: false, docId: null, initialStatus: 'approved' });
        }}
        onCancel={() => setModal({ open: false, docId: null, initialStatus: 'approved' })}
      />
    </>
  );
}