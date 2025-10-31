import React, { useEffect, useMemo } from 'react';
import { Typography, Space, Card, Divider, Button, Row, Col, Alert } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMyProfile } from '../../features/employee/employeeThunks.js';
import { selectMyProfile } from '../../features/employee/employeeSelectors.js';

import { fetchMyDocuments } from '../../features/document/documentThunks.js';
import { selectMyDocuments, selectMyDocumentsStatus } from '../../features/document/documentSelectors.js';

import { uploadMyDocument } from '../../features/document/documentThunks.js';
import DocumentUpload from '../../components/common/Documents/DocumentUpload.jsx';
import DocumentList from '../../components/common/Documents/DocumentList.jsx';
import StatusBadge from '../../components/common/Status/StatusBadge.jsx';
import { message } from 'antd';
import { downloadTemplate } from '../../api/documents.js';

const { Title, Paragraph, Text } = Typography;

const isOPTUser = (profile) =>
  profile?.citizenshipStatus === 'work_visa' && profile?.workAuthorizationType === 'F1(CPT/OPT)';


function getNextUploadableDoc(docsByType) {
  const byType = (type) => docsByType.find((d) => d.type === type);
  const state = (doc) => (doc ? doc.status : 'not_uploaded');

  const r = byType('opt_receipt');
  if (!r || state(r) === 'not_uploaded' || state(r) === 'rejected') return 'opt_receipt';
  if (state(r) === 'pending') return null; 

  const ead = byType('opt_ead');
  if (!ead || state(ead) === 'not_uploaded' || state(ead) === 'rejected') return 'opt_ead';
  if (state(ead) === 'pending') return null;

  const i983 = byType('i983');
  if (!i983 || state(i983) === 'not_uploaded' || state(i983) === 'rejected') return 'i983';
  if (state(i983) === 'pending') return null;

  const i20 = byType('i20');
  if (!i20 || state(i20) === 'not_uploaded' || state(i20) === 'rejected') return 'i20';
  if (state(i20) === 'pending') return null;

  return null; 
}

export default function VisaStatusPage() {
  const dispatch = useDispatch();
  const profile = useSelector(selectMyProfile);
  const docs = useSelector(selectMyDocuments);
  const docsStatus = useSelector(selectMyDocumentsStatus);

  useEffect(() => {
    dispatch(fetchMyDocuments());
  }, [dispatch]);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, profile]);

  const docsByType = useMemo(() => {
    const map = new Map((docs || []).map((d) => [d.type, d]));
    return ['opt_receipt', 'opt_ead', 'i983', 'i20'].map((type) => map.get(type) || { type, status: 'not_uploaded' });
  }, [docs]);

  const nextUploadable = useMemo(() => getNextUploadableDoc(docsByType), [docsByType]);
  const isOPT = isOPTUser(profile);

  const byType = (type) => docsByType.find((d) => d.type === type);
  const state = (doc) => (doc ? doc.status : 'not_uploaded');

  const renderDocCard = (type, label, showTemplates = false) => {
    const doc = byType(type);
    const docState = state(doc);
    const feedback = doc?.hrFeedback || '';

    let message = '';
    let messageType = 'info';

    if (type === 'opt_receipt') {
      if (docState === 'not_uploaded') {
        message = 'Please upload your OPT Receipt.';
        messageType = 'warning';
      } else if (docState === 'pending') {
        message = 'Waiting for HR to approve your OPT Receipt.';
      } else if (docState === 'approved') {
        message = 'Please upload a copy of your OPT EAD.';
        messageType = 'success';
      } else if (docState === 'rejected') {
        message = `Your OPT Receipt was rejected.${feedback ? ` HR feedback: ${feedback}` : ''} Please re-upload your OPT Receipt.`;
        messageType = 'error';
      }
    } else if (type === 'opt_ead') {
      if (docState === 'not_uploaded') {
        message = 'Please upload a copy of your OPT EAD.';
        messageType = 'warning';
      } else if (docState === 'pending') {
        message = 'Waiting for HR to approve your OPT EAD.';
      } else if (docState === 'approved') {
        message = 'Please download and fill out the I-983 form.';
        messageType = 'success';
      } else if (docState === 'rejected') {
        message = `Your OPT EAD was rejected.${feedback ? ` HR feedback: ${feedback}` : ''} Please re-upload your OPT EAD.`;
        messageType = 'error';
      }
    } else if (type === 'i983') {
      if (docState === 'not_uploaded') {
        message = 'Please download the I-983 templates, fill them out, and upload your completed I-983.';
        messageType = 'warning';
      } else if (docState === 'pending') {
        message = 'Waiting for HR to approve and sign your I-983.';
      } else if (docState === 'approved') {
        message = 'Please send the I-983 along with all necessary documents to your school and upload the new I-20.';
        messageType = 'success';
      } else if (docState === 'rejected') {
        message = `Your I-983 was rejected.${feedback ? ` HR feedback: ${feedback}` : ''} Please fix and re-upload your I-983.`;
        messageType = 'error';
      }
    } else if (type === 'i20') {
      if (docState === 'not_uploaded') {
        message = 'Please upload your new I-20.';
        messageType = 'warning';
      } else if (docState === 'pending') {
        message = 'Waiting for HR to approve your I-20.';
      } else if (docState === 'approved') {
        message = 'All documents have been approved.';
        messageType = 'success';
      } else if (docState === 'rejected') {
        message = `Your I-20 was rejected.${feedback ? ` HR feedback: ${feedback}` : ''} Please fix and re-upload your I-20.`;
        messageType = 'error';
      }
    }

    const canUpload = nextUploadable === type;

    return (
      <Card
        key={type}
        bordered={false}
        title={
          <Space>
            <span>{label}</span>
            <StatusBadge status={docState} />
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {showTemplates && (
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <Text strong>Download Templates:</Text>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={async () => {
                  try {
                    const { blob, filename } = await downloadTemplate('i983-empty');
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename || 'I-983-Empty-Template.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                  } catch (err) {
                    message.error('Failed to download template');
                  }
                }}
              >
                Empty Template
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={async () => {
                  try {
                    const { blob, filename } = await downloadTemplate('i983-sample');
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename || 'I-983-Sample-Template.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                  } catch (err) {
                    message.error('Failed to download template');
                  }
                }}
              >
                Sample Template
              </Button>
            </Space>
          </Space>
        )}


        {message && (
          <Alert
            type={messageType}
            message={message}
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        {canUpload && (
          <DocumentUpload
            restrictedType={type}
            showTypeSelect={false}
            compact={true}
          />
        )}
      </Card>
    );
  };

  if (!isOPT) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography>
          <Title level={3} style={{ margin: 0 }}>Visa Status</Title>
        </Typography>
        <Alert
          message="OPT Visa Status Not Applicable"
          description="This page is only available for employees with F1(CPT/OPT) work authorization."
          type="info"
          showIcon
        />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography>
        <Title level={3} style={{ margin: 0 }}>Visa Status</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Track your OPT visa documents and follow the next steps to stay compliant.
        </Paragraph>
      </Typography>

      {renderDocCard('opt_receipt', 'OPT Receipt')}
      {renderDocCard('opt_ead', 'OPT EAD')}
      {renderDocCard('i983', 'I-983', true)}
      {renderDocCard('i20', 'I-20')}

      <Card bordered={false} title="All Documents" loading={docsStatus === 'loading'}>
        <DocumentList />
      </Card>
    </Space>
  );
}