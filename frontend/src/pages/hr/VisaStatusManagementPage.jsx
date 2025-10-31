import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Space, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles/VisaStatusManagementPage.module.css';
import {
  fetchVisaStatusEmployees,
  fetchPendingVisaDocuments,
  sendNextStepReminderThunk,
} from '../../features/employee/employeeThunks.js';

import {
  selectVisaStatusEmployees,
  selectVisaStatusStatus,
  selectVisaStatusPagination,
  selectPendingVisaDocuments,
  selectPendingVisaDocumentsStatus,
} from '../../features/employee/employeeSelectors.js';

import {
  viewDocumentUrl,
  downloadDocumentThunk,
} from '../../features/document/documentThunks.js';
import { reviewDocumentThunk } from '../../features/document/documentThunks.js';

import VisaStatusList from '../../components/hr/VisaManagement/VisaStatusList.jsx';
import DocumentApproval from '../../components/hr/VisaManagement/DocumentApproval.jsx';
import NotificationSender from '../../components/hr/VisaManagement/NotificationSender.jsx';
import DocumentPreview from '../../components/common/Documents/DocumentPreview.jsx';

const { Title, Paragraph } = Typography;

export default function VisaStatusManagementPage() {
  const dispatch = useDispatch();

  const [query, setQuery] = useState({ page: 1, limit: 10, search: undefined, status: undefined });
  const visaEmployees = useSelector(selectVisaStatusEmployees);
  const visaStatus = useSelector(selectVisaStatusStatus);
  const visaPage = useSelector(selectVisaStatusPagination);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const selectedDocs = useSelector((s) =>
    selectedEmployeeId ? selectPendingVisaDocuments(s, selectedEmployeeId) : []
  );
  const selectedDocsStatus = useSelector((s) =>
    selectedEmployeeId ? selectPendingVisaDocumentsStatus(s, selectedEmployeeId) : 'idle'
  );

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [notifySearch, setNotifySearch] = useState({ text: '', items: [] });
  const notifyOptions = useMemo(() => notifySearch.items, [notifySearch.items]);

  useEffect(() => {
    dispatch(fetchVisaStatusEmployees({ page: query.page, limit: query.limit, search: query.search }));
  }, [dispatch, query.page, query.limit, query.search]);

  // const filteredVisaEmployees = useMemo(() => {
  //   if (!query.status) return visaEmployees;
  //   return (visaEmployees || []).filter((e) => e.citizenshipStatus === query.status);
  // }, [visaEmployees, query.status]);

  const handleVisaSearch = (vals) => {
    setQuery((q) => ({
      ...q,
      page: 1,
      search: vals.search,
      //status: vals.status,
    }));
  };

  const handleVisaPageChange = (page) => {
    setQuery((q) => ({ ...q, page }));
  };

  const handleViewDocuments = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    dispatch(fetchPendingVisaDocuments(employeeId));
  };

  const handleView = (docId) => {
    const doc = (selectedDocs || []).find((d) => d._id === docId);
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

  const handleSearchEmployees = async (text) => {
    setNotifySearch((s) => ({ ...s, text }));
    const res = await dispatch(fetchVisaStatusEmployees({ page: 1, limit: 10, search: text || undefined }));
    if (!res.error) {
      setNotifySearch({ text, items: res.payload?.employees || [] });
    }
  };

  const handleSendReminder = async ({ employeeId }) => {
    const res = await dispatch(sendNextStepReminderThunk(employeeId));
    if (res.error) message.error(res.error.message || 'Failed to send');
    else message.success('Reminder sent');
  };

  return (
    <Space direction="vertical" size="large" className={styles.container}>
      <Typography className={styles.header}>
        <Title level={3} className={styles.title}>Visa Status Management</Title>
        <Paragraph type="secondary" className={styles.description}>
          Track work visa employees, review pending documents, and send reminders.
        </Paragraph>
      </Typography>

      <Row gutter={[16, 16]} className={styles.contentRow}>
        <Col xs={24} lg={14} className={styles.listColumn}>
          <VisaStatusList
            items={visaEmployees}
            loading={visaStatus === 'loading'}
            pagination={visaPage} 
            onChangePage={handleVisaPageChange}
            onSearch={handleVisaSearch}
            onViewDocuments={handleViewDocuments}
            defaultFilter={{ search: query.search}}
          />
        </Col>
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
          <div className={styles.actionSpacer} />
          <div className={styles.cardWrapper}>
            <NotificationSender
              employees={notifyOptions}
              loading={false}
              onSearchEmployees={handleSearchEmployees}
              onSend={handleSendReminder}
            />
          </div>
        </Col>
      </Row>

      <DocumentPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        doc={previewDoc}
        isHR
      />
    </Space>
  );
}