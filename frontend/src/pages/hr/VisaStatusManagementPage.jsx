import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Space, Row, Col, message, Tabs } from 'antd';
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
  selectOptInProgressStatus,
  selectOptInProgressPagination,
  selectPendingVisaDocuments,
  selectPendingVisaDocumentsStatus,
} from '../../features/employee/employeeSelectors.js';

import {
  viewDocumentUrl,
  downloadDocumentThunk,
} from '../../features/document/documentThunks.js';
import { reviewDocumentThunk } from '../../features/document/documentThunks.js';

import InProgressList from '../../components/hr/VisaManagement/InProgressList.jsx';
import AllEmployeesList from '../../components/hr/VisaManagement/AllEmployeesList.jsx';
import DocumentApproval from '../../components/hr/VisaManagement/DocumentApproval.jsx';
import DocumentPreview from '../../components/common/Documents/DocumentPreview.jsx';

const { Title, Paragraph } = Typography;

export default function VisaStatusManagementPage() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('in-progress');
  
  // In Progress tab state
  const [inProgressQuery, setInProgressQuery] = useState({ page: 1, limit: 10 });
  const inProgressEmployees = useSelector(selectOptInProgressEmployees);
  const inProgressStatus = useSelector(selectOptInProgressStatus);
  const inProgressPage = useSelector(selectOptInProgressPagination);

  // All tab state
  const [allQuery, setAllQuery] = useState({ page: 1, limit: 10, search: undefined });
  const allEmployees = useSelector(selectVisaStatusEmployees);
  const allStatus = useSelector(selectVisaStatusStatus);
  const allPage = useSelector(selectVisaStatusPagination);
  const [allSearch, setAllSearch] = useState('');

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const selectedDocs = useSelector((s) =>
    selectedEmployeeId ? selectPendingVisaDocuments(s, selectedEmployeeId) : []
  );
  const selectedDocsStatus = useSelector((s) =>
    selectedEmployeeId ? selectPendingVisaDocumentsStatus(s, selectedEmployeeId) : 'idle'
  );

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'in-progress') {
      dispatch(fetchOptInProgressEmployees({ page: inProgressQuery.page, limit: inProgressQuery.limit }));
    } else {
      dispatch(fetchVisaStatusEmployees({ page: allQuery.page, limit: allQuery.limit, search: allQuery.search }));
    }
  }, [dispatch, activeTab, inProgressQuery.page, inProgressQuery.limit, allQuery.page, allQuery.limit, allQuery.search]);

  const handleInProgressPageChange = (page) => {
    setInProgressQuery((q) => ({ ...q, page }));
  };

  const handleAllPageChange = (page) => {
    setAllQuery((q) => ({ ...q, page }));
  };

  const handleViewDocument = (employeeId, docId) => {
    setSelectedEmployeeId(employeeId);
    dispatch(fetchPendingVisaDocuments(employeeId));
    const doc = (selectedDocs || []).find((d) => d._id === docId);
    if (doc) {
      setPreviewDoc(doc);
      setPreviewOpen(true);
      dispatch(viewDocumentUrl({ docId, hr: true }));
    }
  };

  const handleViewPendingDocument = async (employeeId, docId) => {
    setSelectedEmployeeId(employeeId);
    const res = await dispatch(fetchPendingVisaDocuments(employeeId));
    if (!res.error && res.payload) {
      const { documents } = res.payload;
      const doc = documents?.find((d) => d._id === docId);
      if (doc) {
        setPreviewDoc(doc);
        setPreviewOpen(true);
        dispatch(viewDocumentUrl({ docId, hr: true }));
      }
    }
  };

  const handleView = (docId) => {
    const doc = (selectedDocs || []).find((d) => d._id === docId);
    if (!doc) return;
    setPreviewDoc(doc);
    setPreviewOpen(true);
    dispatch(viewDocumentUrl({ docId, hr: true }));
  };

  const handleViewAllDocument = (employeeId, docId) => {
    // For approved documents in All tab, we can view directly
    const employee = allEmployees.find(e => e._id === employeeId);
    const doc = employee?.documents?.find(d => d._id === docId && d.status === 'approved');
    if (doc) {
      setPreviewDoc(doc);
      setPreviewOpen(true);
      dispatch(viewDocumentUrl({ docId, hr: true }));
    }
  };

  const handleDownloadAllDocument = async (employeeId, docId) => {
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
      if (selectedEmployeeId) dispatch(fetchPendingVisaDocuments(selectedEmployeeId));
    }
  };

  const handleReject = async ({ docId, hrFeedback }) => {
    const res = await dispatch(reviewDocumentThunk({ docId, status: 'rejected', hrFeedback }));
    if (res.error) message.error(res.error.message || 'Rejection failed');
    else {
      message.success('Rejected');
      if (selectedEmployeeId) dispatch(fetchPendingVisaDocuments(selectedEmployeeId));
    }
  };

  const handleSendNotification = async (employeeId) => {
    const res = await dispatch(sendNextStepReminderThunk(employeeId));
    if (res.error) message.error(res.error.message || 'Failed to send');
    else {
      message.success('Reminder sent');
      // Refresh in-progress list
      dispatch(fetchOptInProgressEmployees({ page: inProgressQuery.page, limit: inProgressQuery.limit, search: inProgressQuery.search }));
    }
  };

  const tabItems = [
    {
      key: 'in-progress',
      label: 'In Progress',
      children: (
        <Row gutter={[16, 16]} className={styles.contentRow}>
          <Col xs={24} lg={activeTab === 'in-progress' && selectedDocs.length > 0 ? 14 : 24} className={styles.listColumn}>
            <InProgressList
              items={inProgressEmployees}
              loading={inProgressStatus === 'loading'}
              pagination={inProgressPage}
              onChangePage={handleInProgressPageChange}
              onViewDocument={handleViewPendingDocument}
              onSendNotification={handleSendNotification}
            />
          </Col>
          {selectedDocs.length > 0 && (
            <Col xs={24} lg={10} className={styles.actionColumn}>
              <div className={styles.cardWrapper}>
                <DocumentApproval
                  documents={selectedDocs}
                  loading={selectedDocsStatus === 'loading'}
                  onView={handleView}
                  onDownload={handleDownload}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: 'all',
      label: 'All',
      children: (
        <AllEmployeesList
          items={allEmployees}
          loading={allStatus === 'loading'}
          pagination={allPage}
          onChangePage={handleAllPageChange}
          onViewDocument={handleViewAllDocument}
          onDownloadDocument={handleDownloadAllDocument}
          searchValue={allSearch}
          onSearchChange={setAllSearch}
        />
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" className={styles.container}>
      <Typography className={styles.header}>
        <Title level={3} className={styles.title}>Visa Status Management</Title>
        <Paragraph type="secondary" className={styles.description}>
          Track work visa employees, review pending documents, and send reminders.
        </Paragraph>
      </Typography>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      <DocumentPreview
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewDoc(null);
        }}
        doc={previewDoc}
        isHR
      />
    </Space>
  );
}