import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Typography, Space, Row, Col, message, Tabs, Table, Tag, Button, Alert, Empty, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles/VisaStatusManagementPage.module.css';
import {
  fetchVisaStatusEmployees,
  fetchOptInProgressEmployees,
  fetchPendingVisaDocuments,
  sendNextStepReminderThunk,
} from '../../features/employee/employeeThunks.js';
import {
  selectVisaStatusEmployees,
  selectVisaStatusStatus,
  selectVisaStatusPagination,
  selectOptInProgressEmployees,
  selectOptInProgressPagination,
  selectOptInProgressStatus,
  selectPendingVisaDocuments,
  selectPendingVisaDocumentsStatus,
} from '../../features/employee/employeeSelectors.js';
import {
  viewDocumentUrl,
  downloadDocumentThunk,
  fetchEmployeeDocuments,
} from '../../features/document/documentThunks.js';
import { reviewDocumentThunk } from '../../features/document/documentThunks.js';
import { selectEmployeeDocuments } from '../../features/document/documentSelectors.js';
import DocumentPreview from '../../components/common/Documents/DocumentPreview.jsx';
import FeedbackModal from '../../components/common/Modals/FeedbackModal.jsx';
import { EyeOutlined, DownloadOutlined, CheckOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

function citizenshipTag(c) {
  if (c === 'work_visa') return <Tag color="blue">Work Visa</Tag>;
  if (c === 'permanent_resident') return <Tag color="green">Permanent Resident</Tag>;
  if (c === 'citizen') return <Tag color="green">U.S. Citizen</Tag>;
  return <Tag>Unknown</Tag>;
}

function daysLeft(visaEndDate) {
  if (!visaEndDate) return null;
  return dayjs(visaEndDate).diff(dayjs(), 'day');
}

function getLegalName(employee) {
  const parts = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean);
  return parts.join(' ') || employee.preferredName || employee.username || 'Unknown';
}

export default function VisaStatusManagementPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('in-progress');

  // Search state for live search
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // In Progress
  const optInProgress = useSelector(selectOptInProgressEmployees);
  const optInProgressStatus = useSelector(selectOptInProgressStatus);
  const optInProgressPage = useSelector(selectOptInProgressPagination);

  // All
  const visaEmployees = useSelector(selectVisaStatusEmployees);
  const visaStatus = useSelector(selectVisaStatusStatus);
  const visaPage = useSelector(selectVisaStatusPagination);

  // Selected employee state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const selectedPendingDocs = useSelector((s) =>
    selectedEmployeeId ? selectPendingVisaDocuments(s, selectedEmployeeId) : []
  );
  const selectedPendingDocsStatus = useSelector((s) =>
    selectedEmployeeId ? selectPendingVisaDocumentsStatus(s, selectedEmployeeId) : 'idle'
  );
  const selectedAllDocs = useSelector((s) =>
    selectedEmployeeId ? selectEmployeeDocuments(s, selectedEmployeeId) : []
  );

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, docId: null, initialStatus: 'approved' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Reset selection when switching tabs
  useEffect(() => {
    setSelectedEmployeeId(null);
  }, [activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'in-progress') {
      dispatch(fetchOptInProgressEmployees({ page: 1, limit: 50, search: debouncedSearch || undefined }));
    } else {
      dispatch(fetchVisaStatusEmployees({ page: 1, limit: 50, search: debouncedSearch || undefined }));
    }
  }, [dispatch, activeTab, debouncedSearch]);

  // Filter employees locally for live search
  const filteredInProgress = useMemo(() => {
    if (!debouncedSearch.trim()) return optInProgress;
    const searchLower = debouncedSearch.toLowerCase();
    return (optInProgress || []).filter((e) => {
      const firstName = (e?.firstName || '').toLowerCase();
      const lastName = (e?.lastName || '').toLowerCase();
      const preferredName = (e?.preferredName || '').toLowerCase();
      return firstName.includes(searchLower) || lastName.includes(searchLower) || preferredName.includes(searchLower);
    });
  }, [optInProgress, debouncedSearch]);

  const filteredAll = useMemo(() => {
    if (!debouncedSearch.trim()) return visaEmployees;
    const searchLower = debouncedSearch.toLowerCase();
    return (visaEmployees || []).filter((e) => {
      const firstName = (e?.firstName || '').toLowerCase();
      const lastName = (e?.lastName || '').toLowerCase();
      const preferredName = (e?.preferredName || '').toLowerCase();
      return firstName.includes(searchLower) || lastName.includes(searchLower) || preferredName.includes(searchLower);
    });
  }, [visaEmployees, debouncedSearch]);

  const handleViewDocuments = useCallback((employeeId) => {
    setSelectedEmployeeId(employeeId);
    dispatch(fetchPendingVisaDocuments(employeeId));
    if (activeTab === 'all') {
      dispatch(fetchEmployeeDocuments(employeeId));
    }
  }, [dispatch, activeTab]);

  const handleView = (docId) => {
    const docs = activeTab === 'in-progress' ? selectedPendingDocs : selectedAllDocs;
    const doc = docs.find((d) => d._id === docId);
    if (!doc) return;
    setPreviewDoc(doc);
    setPreviewOpen(true);
    dispatch(viewDocumentUrl({ docId, hr: true }));
  };

  const handleDownload = async (docId) => {
    const res = await dispatch(downloadDocumentThunk({ docId, hr: true }));
    const payload = res?.payload;
    if (!payload?.blob) {
      message.error('Failed to download');
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(payload.blob);
    link.download = payload.filename || 'document';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  };

  const handleApprove = async ({ docId, hrFeedback }) => {
    const res = await dispatch(reviewDocumentThunk({ docId, status: 'approved', hrFeedback }));
    if (res.error) message.error(res.error.message || 'Approval failed');
    else {
      message.success('Approved');
      if (selectedEmployeeId) {
        dispatch(fetchPendingVisaDocuments(selectedEmployeeId));
        dispatch(fetchOptInProgressEmployees({ page: 1, limit: 50 }));
      }
    }
  };

  const handleReject = async ({ docId, hrFeedback }) => {
    const res = await dispatch(reviewDocumentThunk({ docId, status: 'rejected', hrFeedback }));
    if (res.error) message.error(res.error.message || 'Rejection failed');
    else {
      message.success('Rejected');
      if (selectedEmployeeId) {
        dispatch(fetchPendingVisaDocuments(selectedEmployeeId));
        dispatch(fetchOptInProgressEmployees({ page: 1, limit: 50 }));
      }
    }
  };

  const handleSendReminder = useCallback(async (employeeId) => {
    const res = await dispatch(sendNextStepReminderThunk(employeeId));
    if (res.error) message.error(res.error.message || 'Failed to send');
    else message.success('Reminder sent');
  }, [dispatch]);

  // Search result message
  const searchResultMessage = useMemo(() => {
    if (!debouncedSearch.trim()) return null;
    const count = activeTab === 'in-progress' ? filteredInProgress.length : filteredAll.length;
    if (count === 0) {
      return { type: 'info', message: 'No records found' };
    } else if (count === 1) {
      return { type: 'success', message: '1 record found' };
    } else {
      return { type: 'success', message: `${count} records found` };
    }
  }, [debouncedSearch, activeTab, filteredInProgress.length, filteredAll.length]);

  // In Progress columns
  const inProgressColumns = useMemo(
    () => [
      {
        title: 'Name (Legal Full Name)',
        key: 'name',
        render: (_, r) => <strong>{getLegalName(r)}</strong>,
        ellipsis: true,
      },
      {
        title: 'Work Authorization',
        key: 'workAuth',
        render: (_, r) => (
          <Space direction="vertical" size={0}>
            <div>
              <Tag>{r.workAuthorizationType || '—'}</Tag>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>
              {r.visaStartDate ? dayjs(r.visaStartDate).format('YYYY-MM-DD') : '—'} →{' '}
              {r.visaEndDate ? dayjs(r.visaEndDate).format('YYYY-MM-DD') : '—'}
            </div>
            <div style={{ fontSize: '12px' }}>
              Days Remaining:{' '}
              <Tag color={r.daysRemaining <= 30 ? 'red' : r.daysRemaining <= 90 ? 'orange' : 'default'}>
                {r.daysRemaining ?? '—'}
              </Tag>
            </div>
          </Space>
        ),
      },
      {
        title: 'Next Steps',
        key: 'nextStep',
        render: (_, r) => (
          <div style={{ maxWidth: 300 }}>
            <div style={{ marginBottom: 8 }}>{r.nextStep}</div>
            {r.pendingDoc && (
              <Tag color="gold">Pending: {r.pendingDoc.type.replace(/_/g, ' ').toUpperCase()}</Tag>
            )}
          </div>
        ),
        ellipsis: true,
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, r) => {
          if (r.pendingDoc) {
            return (
              <Button
                type="primary"
                size="small"
                onClick={() => handleViewDocuments(r._id)}
              >
                Review Document
              </Button>
            );
          } else {
            return (
              <Button
                type="default"
                icon={<SendOutlined />}
                size="small"
                onClick={() => handleSendReminder(r._id)}
              >
                Send Notification
              </Button>
            );
          }
        },
      },
    ],
    [handleViewDocuments, handleSendReminder]
  );

  // All columns
  const allColumns = useMemo(
    () => [
      {
        title: 'Name (Legal Full Name)',
        key: 'name',
        render: (_, r) => <strong>{getLegalName(r)}</strong>,
        ellipsis: true,
      },
      {
        title: 'Work Authorization',
        key: 'workAuth',
        render: (_, r) => (
          <Space direction="vertical" size={0}>
            <div>
              <Tag>{r.workAuthorizationType || '—'}</Tag>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>
              {r.visaStartDate ? dayjs(r.visaStartDate).format('YYYY-MM-DD') : '—'} →{' '}
              {r.visaEndDate ? dayjs(r.visaEndDate).format('YYYY-MM-DD') : '—'}
            </div>
            <div style={{ fontSize: '12px' }}>
              Days Remaining:{' '}
              <Tag color={r.daysRemaining <= 30 ? 'red' : r.daysRemaining <= 90 ? 'orange' : 'default'}>
                {r.daysRemaining ?? '—'}
              </Tag>
            </div>
          </Space>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, r) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedEmployeeId(r._id);
              dispatch(fetchEmployeeDocuments(r._id));
            }}
          >
            View Documents
          </Button>
        ),
      },
    ],
    [dispatch]
  );

  // Approved documents columns
  const approvedDocsColumns = useMemo(
    () => [
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (v) => (v || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      },
      {
        title: 'File',
        dataIndex: 'fileName',
        key: 'fileName',
        render: (v) => v || '—',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (v) => (v === 'approved' ? <Tag color="green">Approved</Tag> : <Tag>{v}</Tag>),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, r) => (
          <Space>
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(r._id)}>
              Preview
            </Button>
            <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownload(r._id)}>
              Download
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  const approvedDocs = useMemo(
    () => (selectedAllDocs || []).filter((d) => d.status === 'approved'),
    [selectedAllDocs]
  );

  return (
    <Space direction="vertical" size="large" className={styles.container}>
      <Typography className={styles.header}>
        <Title level={3} className={styles.title}>Visa Status Management</Title>
        <Paragraph type="secondary" className={styles.description}>
          Track work visa employees, review pending documents, and send reminders.
        </Paragraph>
      </Typography>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'in-progress',
              label: 'In Progress',
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                      <Card>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                          <div>
                            <input
                              type="text"
                              placeholder="Search by first name, last name, or preferred name"
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                fontSize: '14px',
                              }}
                            />
                            {searchResultMessage && (
                              <Alert
                                type={searchResultMessage.type}
                                message={searchResultMessage.message}
                                style={{ marginTop: 8 }}
                                showIcon
                              />
                            )}
                          </div>

                          <Table
                            rowKey={(r) => r._id}
                            columns={inProgressColumns}
                            dataSource={filteredInProgress}
                            loading={optInProgressStatus === 'loading'}
                            pagination={false}
                            locale={{ emptyText: <Empty description="No employees in progress" /> }}
                          />
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      {selectedEmployeeId && selectedPendingDocs.length > 0 && (
                        <Card title="Pending Document Review">
                          <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            {selectedPendingDocs.map((doc) => (
                              <Card key={doc._id} size="small" style={{ marginBottom: 8 }}>
                                <div style={{ marginBottom: 8 }}>
                                  <strong>{doc.type.replace(/_/g, ' ').toUpperCase()}</strong>
                                  <br />
                                  <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>
                                    {doc.fileName}
                                  </span>
                                </div>
                                <Space>
                                  <Button
                                    icon={<EyeOutlined />}
                                    size="small"
                                    onClick={() => handleView(doc._id)}
                                  >
                                    Preview
                                  </Button>
                                  <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() =>
                                      setFeedbackModal({ open: true, docId: doc._id, initialStatus: 'approved' })
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={() =>
                                      setFeedbackModal({ open: true, docId: doc._id, initialStatus: 'rejected' })
                                    }
                                  >
                                    Reject
                                  </Button>
                                </Space>
                              </Card>
                            ))}
                          </Space>
                        </Card>
                      )}
                    </Col>
                  </Row>
                </Space>
              ),
            },
            {
              key: 'all',
              label: 'All',
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                      <Card>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                          <div>
                            <input
                              type="text"
                              placeholder="Search by first name, last name, or preferred name"
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                fontSize: '14px',
                              }}
                            />
                            {searchResultMessage && (
                              <Alert
                                type={searchResultMessage.type}
                                message={searchResultMessage.message}
                                style={{ marginTop: 8 }}
                                showIcon
                              />
                            )}
                          </div>

                          <Table
                            rowKey={(r) => r._id}
                            columns={allColumns}
                            dataSource={filteredAll}
                            loading={visaStatus === 'loading'}
                            pagination={false}
                            locale={{ emptyText: <Empty description="No employees found" /> }}
                          />
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      {selectedEmployeeId && (
                        <Card title="Approved Documents">
                          {approvedDocs.length === 0 ? (
                            <Empty description="No approved documents" />
                          ) : (
                            <Table
                              rowKey={(r) => r._id}
                              columns={approvedDocsColumns}
                              dataSource={approvedDocs}
                              pagination={false}
                              size="small"
                            />
                          )}
                        </Card>
                      )}
                    </Col>
                  </Row>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <DocumentPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        doc={previewDoc}
        isHR
      />

      <FeedbackModal
        open={feedbackModal.open}
        initialStatus={feedbackModal.initialStatus}
        submitting={false}
        onSubmit={async ({ status, hrFeedback }) => {
          if (status === 'approved') await handleApprove({ docId: feedbackModal.docId, hrFeedback });
          else await handleReject({ docId: feedbackModal.docId, hrFeedback });
          setFeedbackModal({ open: false, docId: null, initialStatus: 'approved' });
        }}
        onCancel={() => setFeedbackModal({ open: false, docId: null, initialStatus: 'approved' })}
      />
    </Space>
  );
}
