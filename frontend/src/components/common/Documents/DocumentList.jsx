import React, { useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Popconfirm, message, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyDocuments,
  fetchEmployeeDocuments,
  reviewDocumentThunk,
} from '../../../features/document/documentThunks.js';
import {
  selectMyDocuments,
  selectMyDocumentsStatus,
  selectEmployeeDocuments,
  selectEmployeeDocumentsStatus,
} from '../../../features/document/documentSelectors.js';
import DocumentStatus from './DocumentStatus.jsx';
import DocumentPreview from './DocumentPreview.jsx';

const { Text } = Typography;

const typeLabel = (t) =>
  String(t || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function DocumentList({
  isHR = false,
  employeeId,          
  documents,           
  loading,             
}) {
  const dispatch = useDispatch();
  const myDocs = useSelector(selectMyDocuments);
  const myStatus = useSelector(selectMyDocumentsStatus);
  const empDocs = useSelector((s) => (employeeId ? selectEmployeeDocuments(s, employeeId) : []));
  const empStatus = useSelector((s) =>
    employeeId ? selectEmployeeDocumentsStatus(s, employeeId) : 'idle'
  );

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (documents !== undefined) return;
    
    const currentStatus = isHR ? empStatus : myStatus;
    if (currentStatus === 'idle') {
      if (isHR && employeeId) {
        dispatch(fetchEmployeeDocuments(employeeId)).catch((err) => {
          console.error('Failed to fetch employee documents:', err);
        });
      } else if (!isHR) {
        dispatch(fetchMyDocuments()).catch((err) => {
          console.error('Failed to fetch my documents:', err);
        });
      }
    }
  }, [dispatch, isHR, employeeId, documents, empStatus, myStatus]);

  const data = useMemo(() => {
    if (documents !== undefined) return documents;
    return isHR ? empDocs : myDocs;
  }, [documents, isHR, myDocs, empDocs]);

  const tableLoading = loading ?? (isHR ? empStatus === 'loading' : myStatus === 'loading');

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
    setPreviewOpen(true);
  };

  const handleReview = async (doc, status) => {
    const res = await dispatch(
      reviewDocumentThunk({ docId: doc._id, status, hrFeedback: undefined })
    );
    if (res.error) {
      message.error(res.error.message || 'Failed to update');
    } else {
      message.success(`Marked as ${status}`);
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (v) => typeLabel(v),
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (v) => (v ? <Text code>{v}</Text> : <Text type="secondary">N/A</Text>),
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <DocumentStatus status={record.status} hrFeedback={record.hrFeedback} />
      ),
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => handlePreview(record)} disabled={!record.fileName}>
            Preview
          </Button>
          {isHR && (
            <>
              <Popconfirm
                title="Approve document?"
                onConfirm={() => handleReview(record, 'approved')}
              >
                <Button size="small" type="primary">Approve</Button>
              </Popconfirm>
              <Popconfirm
                title="Reject document?"
                onConfirm={() => handleReview(record, 'rejected')}
              >
                <Button size="small" danger>Reject</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
      width: isHR ? 250 : 100,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
      width: 160,
      responsive: ['sm', 'md', 'lg'],
    },
  ];

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey={(r) => r._id || `${r.type}-${r.fileName || 'none'}`}
          columns={columns}
          dataSource={data || []}
          loading={tableLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </div>

      <DocumentPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        doc={previewDoc}
        isHR={isHR}
      />
    </>
  );
}