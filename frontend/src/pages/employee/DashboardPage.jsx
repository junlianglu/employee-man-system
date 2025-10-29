import React, { useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Space, Button, List, Progress, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchMyProfile, fetchOnboardingStatus } from '../../features/employee/employeeThunks.js';
import {
  selectMyProfile,
  selectOnboardingStatusData,
  selectOnboardingStatusState,
} from '../../features/employee/employeeSelectors.js';

import { fetchMyDocuments } from '../../features/document/documentThunks.js';
import {
  selectMyDocuments,
  selectMyDocumentsStatus,
} from '../../features/document/documentSelectors.js';

import StatusBadge from '../../components/common/Status/StatusBadge.jsx';
import StatusMessage from '../../components/common/Status/StatusMessage.jsx';
import { ALLOWED_TYPES } from '../../api/documents.js';

const { Title, Text } = Typography;

function toLabel(s) {
  return String(s || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector(selectMyProfile);
  const onboarding = useSelector(selectOnboardingStatusData);
  const onboardingStatus = useSelector(selectOnboardingStatusState);
  const myDocs = useSelector(selectMyDocuments);
  const myDocsStatus = useSelector(selectMyDocumentsStatus);

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
    dispatch(fetchOnboardingStatus());
    dispatch(fetchMyDocuments());
  }, [dispatch]); 

  const docsByType = useMemo(() => {
    const map = new Map((myDocs || []).map((d) => [d.type, d]));
    return ALLOWED_TYPES.map((type) => {
      return map.get(type) || { type, status: 'not_uploaded', fileName: null, _id: `${type}-placeholder` };
    });
  }, [myDocs]);

  const approvedCount = (docsByType || []).filter((d) => d.status === 'approved').length;
  const totalCount = docsByType.length || 1;
  const percentApproved = Math.round((approvedCount / totalCount) * 100);

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
      return { type: 'warning', text: 'Please download the I-983 templates, fill out the form, and upload it.' };
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
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card bordered={false}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Welcome{profile?.firstName ? `, ${profile.firstName}` : ''}!
            </Title>
            <Text type="secondary">
              {profile?.email || 'Your account'} {profile?.username ? `(${profile.username})` : ''}
            </Text>
            <Divider />
            <Space wrap>
              <Button type="default" onClick={() => navigate('/employee/personal-info')}>Personal Info</Button>
              <Button type="default" onClick={() => navigate('/employee/documents')}>My Documents</Button>
              <Button type="default" onClick={() => navigate('/employee/visa-status')}>Visa Status</Button>
              <Button type="primary" onClick={() => navigate('/employee/onboarding')}>Onboarding</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} title="Documents Progress">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Progress percent={percentApproved} status={myDocsStatus === 'loading' ? 'active' : undefined} />
              <Text type="secondary">
                {approvedCount} of {totalCount} documents approved
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            title="Onboarding Status"
            extra={
              onboarding?.status ? (
                <StatusBadge status={onboarding.status} />
              ) : null
            }
            loading={onboardingStatus === 'loading'}
          >
            {onboarding?.hrFeedback && (
              <StatusMessage
                status={onboarding.status === 'rejected' ? 'error' : 'info'}
                title={toLabel(onboarding.status)}
                description={onboarding.hrFeedback}
              />
            )}
            {!onboarding?.hrFeedback && onboarding?.status && (
              <Text type="secondary">Current status: {toLabel(onboarding.status)}</Text>
            )}
            <Divider />
            <Space>
              <Button type="primary" onClick={() => navigate('/employee/onboarding')}>Open Onboarding</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card bordered={false} title="Next Step">
            {nextStepInfo ? (
              <StatusMessage
                status={nextStepInfo.type}
                title="Visa Document Next Step"
                description={nextStepInfo.text}
              />
            ) : (
              <Text type="secondary">
                No immediate actions required. Review your visa and documents for any updates.
              </Text>
            )}
            <Divider />
            <Space>
              <Button onClick={() => navigate('/employee/visa-status')}>Go to Visa Status</Button>
              <Button onClick={() => navigate('/employee/documents')}>Manage Documents</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card bordered={false} title="Document Overview" loading={myDocsStatus === 'loading'}>
            <List
              dataSource={docsByType}
              rowKey={(item) => item._id || item.type}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="manage" size="small" onClick={() => navigate('/employee/documents')}>
                      Manage
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={toLabel(item.type)}
                    description={
                      <Space>
                        <StatusBadge status={item.status} />
                        {item.fileName ? <Text code>{item.fileName}</Text> : <Text type="secondary">Not uploaded</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}