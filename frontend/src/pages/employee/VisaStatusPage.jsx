import React, { useEffect, useMemo } from 'react';
import { Typography, Space, Card, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMyProfile } from '../../features/employee/employeeThunks.js';
import { selectMyProfile } from '../../features/employee/employeeSelectors.js';

import { fetchMyDocuments } from '../../features/document/documentThunks.js';
import { selectMyDocuments, selectMyDocumentsStatus } from '../../features/document/documentSelectors.js';

import StatusMessage from '../../components/common/Status/StatusMessage.jsx';
import DocumentUpload from '../../components/common/Documents/DocumentUpload.jsx';
import DocumentList from '../../components/common/Documents/DocumentList.jsx';
import { ALLOWED_TYPES } from '../../api/documents.js';

const { Title, Paragraph, Text } = Typography;

export default function VisaStatusPage() {
  const dispatch = useDispatch();
  const profile = useSelector(selectMyProfile);
  const docs = useSelector(selectMyDocuments);
  const docsStatus = useSelector(selectMyDocumentsStatus);

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
    dispatch(fetchMyDocuments());
  }, [dispatch, profile]);

  const docsByType = useMemo(() => {
    const map = new Map((docs || []).map((d) => [d.type, d]));
    return ALLOWED_TYPES.map((type) => map.get(type) || { type, status: 'not_uploaded' });
  }, [docs]);

  const nextStepInfo = useMemo(() => {
    const byType = (type) => (docsByType || []).find((d) => d.type === type);
    const state = (doc) => (doc ? doc.status : 'not_uploaded');
    const feedback = (doc) => (doc?.hrFeedback ? ` HR feedback: ${doc.hrFeedback}` : '');

    if (profile?.citizenshipStatus !== 'work_visa' || profile?.workAuthorizationType !== 'F1(CPT/OPT)') {
      return null;
    }

    const r = byType('opt_receipt');
    if (state(r) === 'not_uploaded') return { type: 'warning', text: 'Please upload your OPT Receipt.' };
    if (state(r) === 'pending') return { type: 'info', text: 'Waiting for HR to approve your OPT Receipt.' };
    if (state(r) === 'rejected') return { type: 'error', text: `Your OPT Receipt was rejected.${feedback(r)} Please re-upload your OPT Receipt.` };

    const ead = byType('opt_ead');
    if (state(ead) === 'not_uploaded') return { type: 'warning', text: 'Please upload a copy of your OPT EAD.' };
    if (state(ead) === 'pending') return { type: 'info', text: 'Waiting for HR to approve your OPT EAD.' };
    if (state(ead) === 'rejected') return { type: 'error', text: `Your OPT EAD was rejected.${feedback(ead)} Please re-upload your OPT EAD.` };

    const i983 = byType('i983');
    if (state(i983) === 'not_uploaded') {
      return { type: 'warning', text: 'Please download the I-983 templates, fill them out, and upload your completed I-983.' };
    }
    if (state(i983) === 'pending') return { type: 'info', text: 'Waiting for HR to approve and sign your I-983.' };
    if (state(i983) === 'rejected') return { type: 'error', text: `Your I-983 was rejected.${feedback(i983)} Please fix and re-upload your I-983.` };

    const i20 = byType('i20');
    if (state(i20) === 'not_uploaded') return { type: 'warning', text: 'Please upload your new I-20.' };
    if (state(i20) === 'pending') return { type: 'info', text: 'Waiting for HR to approve your I-20.' };
    if (state(i20) === 'rejected') return { type: 'error', text: `Your I-20 was rejected.${feedback(i20)} Please fix and re-upload your I-20.` };

    if (state(i20) === 'approved') return { type: 'success', text: 'All documents have been approved.' };
    return null;
  }, [docsByType, profile]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography>
        <Title level={3} style={{ margin: 0 }}>Visa Status</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Track your visa-related documents and follow the next steps to stay compliant.
        </Paragraph>
      </Typography>

      <Card bordered={false} title="Next Step">
        {nextStepInfo ? (
          <StatusMessage status={nextStepInfo.type} title="Action Required" description={nextStepInfo.text} />
        ) : (
          <Text type="secondary">No immediate actions required for your current visa status.</Text>
        )}
      </Card>

      <Card bordered={false} title="Upload Visa Documents">
        <Paragraph type="secondary" style={{ marginTop: -8 }}>
          Supported file types: JPG, PNG, PDF. Maximum size: 5MB.
        </Paragraph>
        <Divider style={{ margin: '12px 0' }} />
        <DocumentUpload />
      </Card>

      <Card bordered={false} title="My Visa Documents" loading={docsStatus === 'loading'}>
        <DocumentList />
      </Card>
    </Space>
  );
}