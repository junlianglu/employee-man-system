import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Button, Skeleton, Divider, Form, Select, Input, message, List, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import OnboardingForm from '../../components/employee/Onboarding/OnboardingForm.jsx';
import { fetchOnboardingApplicationDetail, reviewOnboardingApplicationThunk } from '../../features/employee/employeeThunks.js';
import { selectApplicationDetail, selectApplicationDetailStatus } from '../../features/employee/employeeSelectors.js';
import { fetchEmployeeDocuments } from '../../features/document/documentThunks.js';
import { selectEmployeeDocuments, selectEmployeeDocumentsStatus } from '../../features/document/documentSelectors.js';
import { hrViewDocument, hrDownloadDocument } from '../../api/documents.js';

function statusTag(status) {
  const map = {
    approved: { color: 'green', text: 'Approved' },
    pending: { color: 'gold', text: 'Pending' },
    rejected: { color: 'red', text: 'Rejected' },
    never_submitted: { color: 'default', text: 'Never Submitted' },
  };
  const s = map[status] || { color: 'default', text: 'Unknown' };
  return <Tag color={s.color}>{s.text}</Tag>;
}

function toLabel(type) {
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OnboardingReviewPage() {
  const { employeeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const detail = useSelector(selectApplicationDetail);
  const detailStatus = useSelector(selectApplicationDetailStatus);
  const employeeDocs = useSelector((state) => selectEmployeeDocuments(state, employeeId));
  const employeeDocsStatus = useSelector((state) => selectEmployeeDocumentsStatus(state, employeeId));

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchOnboardingApplicationDetail(employeeId));
      dispatch(fetchEmployeeDocuments(employeeId));
    }
  }, [dispatch, employeeId]);

  const handleApprove = async (values) => {
    try {
      await dispatch(reviewOnboardingApplicationThunk({
        employeeId,
        status: 'approved',
        hrFeedback: values.hrFeedback?.trim() || ''
      })).unwrap();
      message.success('Application approved');
      dispatch(fetchOnboardingApplicationDetail(employeeId));
      dispatch(fetchEmployeeDocuments(employeeId));
      form.resetFields();
    } catch (e) {
      message.error(e?.message || 'Failed to approve');
    }
  };

  const handleReject = async (values) => {
    if (!values.hrFeedback?.trim()) {
      message.error('Feedback is required when rejecting');
      return;
    }
    try {
      await dispatch(reviewOnboardingApplicationThunk({
        employeeId,
        status: 'rejected',
        hrFeedback: values.hrFeedback.trim()
      })).unwrap();
      message.success('Application rejected');
      dispatch(fetchOnboardingApplicationDetail(employeeId));
      dispatch(fetchEmployeeDocuments(employeeId));
      form.resetFields();
    } catch (e) {
      message.error(e?.message || 'Failed to reject');
    }
  };

  const handleViewDocument = async (doc) => {
    if (!doc?._id) return;
    try {
      const { blob } = await hrViewDocument(doc._id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      message.error(e?.message || 'Failed to open document');
    }
  };

  const handleDownloadDocument = async (doc) => {
    if (!doc?._id) return;
    try {
      const { blob, filename } = await hrDownloadDocument(doc._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error(e?.message || 'Failed to download document');
    }
  };

  const detailName = detail
    ? detail.preferredName || `${detail.firstName || ''} ${detail.lastName || ''}`.trim()
    : '';

  if (detailStatus === 'loading') {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Typography.Text type="secondary">Application not found</Typography.Text>
          <br />
          <Button onClick={() => navigate('/hr/hiring')} style={{ marginTop: 16 }}>
            Back to Hiring Management
          </Button>
        </Card>
      </div>
    );
  }

  const canReview = detail.onboardingReview?.status === 'pending';

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {detailName || detail.username}
              </Typography.Title>
              {statusTag(detail.onboardingReview?.status)}
            </Space>
            <Typography.Text type="secondary">{detail.email}</Typography.Text>
            <Typography.Text type="secondary">@{detail.username}</Typography.Text>
            <Button onClick={() => window.close() || navigate('/hr/hiring')}>
              Close
            </Button>
          </Space>
        </Card>

        {detail.onboardingReview?.hrFeedback && (
          <Card>
            <Typography.Text strong>HR Feedback:</Typography.Text>
            <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              {detail.onboardingReview.hrFeedback}
            </div>
          </Card>
        )}

        <Card title="Onboarding Application">
          <OnboardingForm
            initialValues={detail}
            readOnly={true}
            showAccount={false}
            showEmail={true}
            showActions={false}
          />
        </Card>

        <Card title="Uploaded Documents" loading={employeeDocsStatus === 'loading'}>
          {employeeDocs && employeeDocs.length > 0 ? (
            <List
              dataSource={employeeDocs}
              rowKey={(d) => d._id}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => handleViewDocument(doc)}
                    >
                      View
                    </Button>,
                    <Button
                      key="download"
                      icon={<DownloadOutlined />}
                      size="small"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      Download
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Typography.Text strong>{toLabel(doc.type)}</Typography.Text>
                        <Tag
                          color={
                            doc.status === 'approved'
                              ? 'green'
                              : doc.status === 'rejected'
                              ? 'red'
                              : doc.status === 'pending'
                              ? 'gold'
                              : 'default'
                          }
                        >
                          {doc.status?.toUpperCase() || 'NOT UPLOADED'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        {doc.fileName && (
                          <Typography.Text type="secondary">File: {doc.fileName}</Typography.Text>
                        )}
                        {doc.hrFeedback && (
                          <Typography.Text type="secondary">Feedback: {doc.hrFeedback}</Typography.Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Typography.Text type="secondary">No documents uploaded</Typography.Text>
          )}
        </Card>

        {canReview && (
          <Card title="Review Application">
            <Form
              layout="vertical"
              form={form}
              onFinish={async (vals) => {
                if (vals.decision === 'approved') {
                  await handleApprove(vals);
                } else {
                  await handleReject(vals);
                }
              }}
              initialValues={{ decision: 'approved', hrFeedback: '' }}
            >
              <Row gutter={12}>
                <Col xs={24} md={10}>
                  <Form.Item name="decision" label="Decision" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="approved">Approve</Select.Option>
                      <Select.Option value="rejected">Reject</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={14}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(p, c) => p.decision !== c.decision}
                  >
                    {({ getFieldValue }) => {
                      const isReject = getFieldValue('decision') === 'rejected';
                      return (
                        <Form.Item
                          name="hrFeedback"
                          label="Feedback"
                          rules={[
                            { required: isReject, message: 'Feedback is required when rejecting' },
                            { max: 500 },
                          ]}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder={isReject ? 'Reason for rejection' : 'Optional notes'}
                          />
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </Col>
              </Row>

              <Space>
                <Button htmlType="submit" type="primary" icon={<CheckOutlined />}>
                  Submit
                </Button>
                <Button onClick={() => form.resetFields()} icon={<CloseOutlined />}>
                  Clear
                </Button>
              </Space>
            </Form>
          </Card>
        )}
      </Space>
    </div>
  );
}

